import nodemailer from 'nodemailer';
import axios from 'axios';

// Fonction générique pour envoyer un email avec OAuth 2.0
export const sendEmail = async (recipientEmail, subject, text) => {
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
            text: text
        };

        await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
    }
};