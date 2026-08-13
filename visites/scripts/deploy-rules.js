/**
 * Deploys firestore.rules and storage.rules from the CI job.
 *
 * `firebase deploy --only firestore:rules` cannot be used there: before
 * writing anything the CLI asks serviceusage whether the API is enabled, and
 * the deploy service account is not allowed to read the project's service
 * list — it comes back 403 and the whole deploy stops, rules included. The
 * Firebase Rules API asks for no such thing: a ruleset is created, then the
 * release is pointed at it, which is exactly what the CLI does at the end.
 *
 * Run from `visites/`, with GOOGLE_APPLICATION_CREDENTIALS pointing at a
 * service-account key.
 */
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const PROJECT = "manny-express";
const RULES_API = "https://firebaserules.googleapis.com";

function serviceAccount() {
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!path) throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set.");
  return JSON.parse(readFileSync(path, "utf8"));
}

/** The bucket names the storage release; it lives with the web config. */
function storageBucket() {
  const env = readFileSync(new URL("../.env.production", import.meta.url), "utf8");
  const match = env.match(/^VITE_FIREBASE_STORAGE_BUCKET=(.+)$/m);
  if (!match) throw new Error("VITE_FIREBASE_STORAGE_BUCKET is missing from .env.production.");
  return match[1].trim();
}

async function accessToken(account) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const issued = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: account.token_uri,
    iat: issued,
    exp: issued + 3600,
  })}`;
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(account.private_key, "base64url");

  const response = await fetch(account.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Token refused: ${JSON.stringify(body)}`);
  return body.access_token;
}

async function call(token, method, path, payload) {
  const response = await fetch(`${RULES_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}

async function deploy(token, { file, release }) {
  const created = await call(token, "POST", `/v1/projects/${PROJECT}/rulesets`, {
    source: { files: [{ name: file, content: readFileSync(file, "utf8") }] },
  });
  if (!created.ok) throw new Error(`${file}: ruleset refused (${created.status}) ${created.body}`);
  const rulesetName = JSON.parse(created.body).name;

  const releaseName = `projects/${PROJECT}/releases/${release}`;
  const payload = { release: { name: releaseName, rulesetName } };
  let updated = await call(
    token,
    "PATCH",
    `/v1/${encodeURI(releaseName)}`,
    payload
  );
  // A release that does not exist yet is created rather than patched.
  if (updated.status === 404) {
    updated = await call(token, "POST", `/v1/projects/${PROJECT}/releases`, payload.release);
  }
  if (!updated.ok) throw new Error(`${file}: release refused (${updated.status}) ${updated.body}`);

  console.log(`✔ ${file} → ${release} (${rulesetName.split("/").pop()})`);
}

const token = await accessToken(serviceAccount());
await deploy(token, { file: "firestore.rules", release: "cloud.firestore" });
await deploy(token, { file: "storage.rules", release: `firebase.storage/${storageBucket()}` });
