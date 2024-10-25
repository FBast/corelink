import cron from 'node-cron';
import moment from 'moment';
import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";
import {sendEmail} from "./emailService.js";
import {generateExamPDF} from "./pdfGenerator.js";
import Grade from "../models/gradeModel.js";

// Planification de la tâche toutes les heures
cron.schedule('*/10 * * * * *', async () => {
    console.log('Vérification des sessions d’épreuves en cours...');

    try {
        const ongoingSessions = await Session.find({
            startDate: { $lte: new Date() }, // La date de début est inférieure ou égale à maintenant
            endDate: { $gte: new Date() }    // La date de fin est supérieure ou égale à maintenant
        });

        // Parcourir chaque session en cours
        for (const session of ongoingSessions) {
            // Récupérer les utilisateurs ayant le statut 'waiting_exam' et dont la formation et le grade correspondent à ceux de la session
            const users = await User.find({
                status: 'waiting_exam'
            });

            // Pour chaque utilisateur, générer l'examen et envoyer un email
            for (const user of users) {
                try {
                    // Récupérer le grade correspondant à user.requestedGrade
                    const grade = await Grade.findById(user.requestedGrade).populate('topics');

                    if (!grade) {
                        console.error(`Le grade avec l'ID ${user.requestedGrade} n'a pas été trouvé.`);
                        continue; // Passer à l'utilisateur suivant si le grade n'est pas trouvé
                    }
                    
                    // Générer le PDF de l'examen pour le grade de l'utilisateur
                    const pdfBase64 = await generateExamPDF(grade);

                    // Convertir le PDF de base64 en Buffer
                    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

                    // Envoyer l'email avec l'examen en pièce jointe
                    await sendEmail(
                        user.email,
                        `Votre épreuve de ${session.name} commence bientôt`,
                        `Bonjour ${user.firstName},\n\nVotre épreuve de ${session.name} commence le ${moment(session.startDate).format('LLL')}. Veuillez trouver ci-joint l'examen correspondant.`,
                        [
                            {
                                filename: 'exam.pdf',
                                content: pdfBuffer,
                                contentType: 'application/pdf'
                            }
                        ]
                    );

                    console.log(`Examen envoyé à ${user.email} pour la session ${session.name}.`);
                } catch (error) {
                    console.error(`Erreur lors de l'envoi de l'examen à ${user.email}:`, error);
                }
            }
        }

    } catch (error) {
        console.error('Erreur lors de la vérification des sessions d’épreuves :', error);
    }
});