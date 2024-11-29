import cron from 'node-cron';
import moment from 'moment';
import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "./emailService.js";
import { generateExamPDF } from "./pdfGenerator.js";
import Grade from "../models/gradeModel.js";

// Planification de la tâche toutes les heures
cron.schedule('*/10 * * * * *', async () => {
    //TODO should rework cron jobs !
    console.log('Vérification des sessions d’épreuves en cours...');

    try {
        const now = new Date();

        // Vérifier les sessions en cours
        const ongoingSessions = await Session.find({
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        for (const session of ongoingSessions) {
            const users = await User.find({
                status: 'awaiting_session',
                assignedSession: { $exists: false } // Uniquement les utilisateurs sans session assignée
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
                        `Votre épreuve pour l'ENSI commence !`,
                        `Bonjour ${user.firstName},
                        \n\nVotre épreuve pour la session "${session.name}" commence le ${moment(session.startDate).format('LLL')}.
                        Veuillez trouver ci-joint l'examen correspondant.
                        \nCette épreuve prendra fin le ${moment(session.endDate).format('LLL')}. Pensez à déposer votre travail avant la fin.`,
                        [
                            {
                                filename: 'exam.pdf',
                                content: pdfBuffer,
                                contentType: 'application/pdf'
                            }
                        ]
                    );

                    // Mettre à jour l'utilisateur
                    user.status = 'exam_in_progress';
                    user.examSubject = pdfBuffer; // Sauvegarde du PDF
                    user.assignedSession = session._id; // Assigner la session à l'utilisateur
                    await user.save();

                    console.log(`Examen envoyé à ${user.email} pour la session ${session.name}. Statut mis à jour en 'exam_in_progress'.`);
                } catch (error) {
                    console.error(`Erreur lors de l'envoi de l'examen à ${user.email}:`, error);
                }
            }
        }

        // Vérifier les utilisateurs en exam_in_progress
        const usersInProgress = await User.find({ status: 'exam_in_progress' });

        for (const user of usersInProgress) {
            try {
                if (!user.assignedSession) {
                    console.error(`Utilisateur ${user.email} n'a pas de session assignée.`);
                    continue;
                }

                const session = await Session.findById(user.assignedSession);

                // Si la session n'existe pas ou est terminée, mettre à jour le statut de l'utilisateur
                if (!session || session.endDate < now) {
                    user.status = 'awaiting_appointment';
                    user.assignedSession = undefined; // Nettoyer la session assignée
                    user.examSubject = undefined; // Optionnel : nettoyer le PDF après la session
                    await user.save();

                    console.log(`Utilisateur ${user.email} mis à jour en 'awaiting_appointment' après la fin de la session.`);
                }
            } catch (error) {
                console.error(`Erreur lors de la mise à jour de l'utilisateur ${user.email}:`, error);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des sessions d’épreuves :', error);
    }
});