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
