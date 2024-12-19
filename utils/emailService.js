import nodemailer from 'nodemailer';
import axios from 'axios';

// Fonction générique pour envoyer un email avec OAuth 2.0 et des pièces jointes
export const sendEmail = async (recipientEmail, subject, text, attachments = []) => {
    try {
        // Obtenir un nouveau access token via le refresh token
        const { data } = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            refresh_token: process.env.REFRESH_TOKEN,
            grant_type: 'refresh_token',
        });

        const accessToken = data.access_token;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken  // Utilisation du nouveau access token
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: subject,
            text: text,
            attachments: attachments // Ajout des pièces jointes ici
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email envoyé avec succès à ${recipientEmail} !`);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
    }
};

export const sendVerificationCode = async (user) => {
    const validationToken = Math.floor(100000 + Math.random() * 900000).toString(); // Code à 6 chiffres

    // Mettre à jour l'utilisateur avec le nouveau token et la date d'expiration
    user.validationToken = validationToken;
    user.validationTokenExpires = Date.now() + 3600000; // Expire dans 1 heure
    await user.save();

    const subject = 'Vérification de votre compte';
    const text = `Merci de vous être inscrit sur notre plateforme !
    Votre code de validation est : ${validationToken}
    Veuillez le saisir sur notre site pour activer votre compte.`;

    console.log(`Envoi de l'email avec le code de vérification.`);
    await sendEmail(user.email, subject, text);
};