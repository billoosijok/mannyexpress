// Grants the "owner" role to one account. Run once, from a machine holding a
// service-account key for the Firebase project:
//
//   npm install firebase-admin
//   node scripts/set-owner.js
//
// The claim only reaches the client's token after that user signs out and back
// in (or after getIdToken(true)).
//
// Never commit serviceAccountKey.json.
import admin from "firebase-admin";
import { readFileSync } from "fs";

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"))
  ),
});

const OWNER_EMAIL = "REPLACE_WITH_OWNER_EMAIL";

const user = await admin.auth().getUserByEmail(OWNER_EMAIL);
await admin.auth().setCustomUserClaims(user.uid, { role: "owner" });
console.log("Owner claim set for", user.uid);
