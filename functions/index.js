const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({
    origin: [
        "https://mannyexpress.com",
        "https://manny-express.web.app",
        "https://manny-express.firebaseapp.com",
        "http://localhost:4000",
    ],
});

admin.initializeApp();

// Configure the email transporter
// Note: You need to set these config variables using the Firebase CLI:
// firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});

exports.sendQuoteEmail = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }

        const {
            name,
            phone,
            email,
            from,
            to,
            date_start,
            date_end,
            message,
        } = req.body;

        if (!email) {
            return res.status(400).send({ success: false, error: "Email is required" });
        }

        const mailOptions = {
            from: `Manny Express Website <${functions.config().gmail.email}>`,
            to: "mannyexpress11@gmail.com",
            subject: `Nouvelle demande de devis: ${name}`,
            html: `
        <h2>Nouvelle demande de devis</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Téléphone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr>
        <h3>Détails du déménagement</h3>
        <p><strong>Départ:</strong> ${from}</p>
        <p><strong>Arrivée:</strong> ${to}</p>
        <p><strong>Date de départ:</strong> ${date_start || "Non spécifiée"}</p>
        <p><strong>Date d'arrivée:</strong> ${date_end || "Non spécifiée"}</p>
        <hr>
        <h3>Message</h3>
        <p>${message || "Aucun message"}</p>
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
            functions.logger.info("Email sent successfully", {
                name,
                email,
                from,
                to
            });
            res.status(200).send({ success: true, message: "Email sent successfully" });
        } catch (error) {
            functions.logger.error("Error sending email", error);
            res.status(500).send({ success: false, error: error.message });
        }
    });
});

// ---------------------------------------------------------------------------
// Fiches de visite : prévenir l'équipe
//
// Three people share the app; a sheet or an appointment recorded by one is
// news for the other two. Each phone that accepted notifications has a
// document in `tokens`, keyed by its push token — written by the app, read
// only here.
//
// Deployed in the region the Firestore database lives in: a 1st-gen Firestore
// trigger has to sit next to its database.
// ---------------------------------------------------------------------------

const REGION = "europe-west1";
const TOKENS = "tokens";

async function notifyTeam({ title, body, tag, authorUid }) {
    const snapshot = await admin.firestore().collection(TOKENS).get();
    // Whoever recorded it already knows.
    const targets = snapshot.docs.filter((entry) => entry.get("uid") !== authorUid);
    if (targets.length === 0) return;

    const response = await admin.messaging().sendEachForMulticast({
        tokens: targets.map((entry) => entry.id),
        notification: { title, body },
        data: { tag },
        webpush: {
            fcmOptions: { link: "https://manny-express.web.app/" },
        },
    });

    // A phone that reinstalled the app leaves behind a token nobody answers
    // to; keeping it would mean a failure on every notification from now on.
    const stale = [];
    response.responses.forEach((result, index) => {
        const code = result.error && result.error.code;
        if (
            code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token" ||
            code === "messaging/invalid-argument"
        ) {
            stale.push(targets[index].ref.delete());
        }
    });
    await Promise.all(stale);

    functions.logger.info("Notification envoyée", {
        title,
        sent: response.successCount,
        failed: response.failureCount,
        removed: stale.length,
    });
}

function author(data) {
    return data.createdByEmail || "Un collègue";
}

/** Days are stored as "2026-08-21"; nobody reads a date that way out loud. */
function frenchDay(date) {
    const parts = String(date || "").split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
}

exports.notifyOnVisit = functions
    .region(REGION)
    .firestore.document("visites/{visitId}")
    .onCreate(async (snapshot) => {
        const visit = snapshot.data();
        await notifyTeam({
            title: "Nouvelle fiche de visite",
            body: `${author(visit)} a enregistré la visite de ${visit.clientNom || "client sans nom"}.`,
            tag: `visite-${snapshot.id}`,
            authorUid: visit.createdBy,
        });
    });

exports.notifyOnAgenda = functions
    .region(REGION)
    .firestore.document("agenda/{eventId}")
    .onCreate(async (snapshot) => {
        const event = snapshot.data();
        const kind = event.type === "demenagement" ? "Déménagement" : "Visite";
        const day = frenchDay(event.date);
        const when = event.heure ? `${day} à ${event.heure}` : day;
        await notifyTeam({
            title: `${kind} ajouté à l'agenda`,
            body: `${author(event)} a prévu ${event.clientNom || "un rendez-vous"} le ${when}.`,
            tag: `agenda-${snapshot.id}`,
            authorUid: event.createdBy,
        });
    });
