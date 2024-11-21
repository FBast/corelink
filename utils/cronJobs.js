import cron from 'node-cron';
import moment from 'moment';
import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "./emailService.js";
import { generateExamPDF } from "./pdfGenerator.js";
import Grade from "../models/gradeModel.js";

// Planification de la tâche toutes les heures
cron.schedule('*/10 * * * * *', async () => {
    console.log('Vérification des sessions d’épreuves en cours...');

    try {
        const ongoingSessions = await Session.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        for (const session of ongoingSessions) {
            const users = await User.find({
                status: 'awaiting_exam'
            });

            for (const user of users) {
                try {
                    const grade = await Grade.findById(user.requestedGrade).populate('topics');

                    if (!grade) {
                        console.error(`Le grade avec l'ID ${user.requestedGrade} n'a pas été trouvé.`);
                        continue;
                    }

                    const pdfBase64 = await generateExamPDF(grade);

                    // Convertir le PDF de base64 en Buffer
                    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

                    // Envoyer l'email avec l'examen en pièce jointe
                    await sendEmail(
                        user.email,
                        `Votre épreuve pour l'ENSI' commence !`,
                        `Bonjour ${user.firstName},
                        \n\nVotre épreuve pour la session "${session.name}" commence le ${moment(session.startDate).format('LLL')} au matin. Veuillez trouver ci-joint l'examen correspondant.
                        \nCette épreuve prendra fin le ${moment(session.startDate).format('LLL')} au soir. Pensez à déposer votre travail sur la plateforme d'inscription.`,
                        [
                            {
                                filename: 'exam.pdf',
                                content: pdfBuffer,
                                contentType: 'application/pdf'
                            }
                        ]
                    );

                    // Mettre à jour le statut et sauvegarder le PDF dans l'utilisateur
                    user.status = 'exam_in_progress';
                    user.examPdf = pdfBuffer; // Sauvegarde du PDF
                    await user.save();

                    console.log(`Examen envoyé à ${user.email} pour la session ${session.name}. Statut mis à jour en 'exam_in_progress'.`);
                } catch (error) {
                    console.error(`Erreur lors de l'envoi de l'examen à ${user.email}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des sessions d’épreuves :', error);
    }
});
