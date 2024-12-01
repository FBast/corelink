import moment from 'moment';
import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";
import Grade from "../models/gradeModel.js";
import { sendEmail } from "./emailService.js";
import { generateExamPDF } from "./pdfGenerator.js";

// Fonction principale pour gérer toutes les tâches planifiées
export async function processCronJobs() {
    console.log('Début du traitement des tâches planifiées...');
    try {
        await processAwaitingSessionUsers();
        await processExamInProgressUsers();
    } catch (error) {
        console.error('Erreur lors de l\'exécution des tâches planifiées :', error);
    }
}

// Gère les utilisateurs en `awaiting_session`
async function processAwaitingSessionUsers() {
    console.log('Traitement des utilisateurs en attente de session...');
    const now = new Date();

    const ongoingSessions = await Session.find({
        startDate: { $lte: now },
        endDate: { $gte: now }
    });

    for (const session of ongoingSessions) {
        const users = await User.find({
            status: 'awaiting_session',
            assignedSession: { $exists: false } // Uniquement ceux sans session assignée
        });

        for (const user of users) {
            await assignSessionToUser(user, session);
        }
    }
}

// Assigne une session à un utilisateur et lui envoie l'examen
async function assignSessionToUser(user, session) {
    try {
        const grade = await Grade.findById(user.requestedGrade).populate('topics');
        if (!grade) {
            console.error(`Grade introuvable pour l'utilisateur ${user.email}`);
            return;
        }

        const pdfBase64 = await generateExamPDF(grade);
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        // Envoyer l'email avec l'examen
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

        // Mise à jour des données utilisateur
        user.status = 'exam_in_progress';
        user.examSubject = pdfBuffer; // Sauvegarde du PDF
        user.assignedSession = session._id; // Assigner la session
        await user.save();

        console.log(`Examen envoyé à ${user.email} pour la session ${session.name}.`);
    } catch (error) {
        console.error(`Erreur lors de l'assignation de la session pour ${user.email}:`, error);
    }
}

// Gère les utilisateurs en `exam_in_progress`
async function processExamInProgressUsers() {
    console.log('Traitement des utilisateurs en examen en cours...');
    const now = new Date();

    const usersInProgress = await User.find({ status: 'exam_in_progress' });

    for (const user of usersInProgress) {
        await finalizeExamForUser(user, now);
    }
}

// Vérifie si l'examen d'un utilisateur doit être terminé
async function finalizeExamForUser(user, now) {
    try {
        if (!user.assignedSession) {
            console.error(`Utilisateur ${user.email} n'a pas de session assignée.`);
            return;
        }

        const session = await Session.findById(user.assignedSession);

        // Si la session n'existe pas ou est terminée
        if (!session || session.endDate < now) {
            user.status = 'awaiting_appointment';
            user.assignedSession = undefined; // Nettoyer la session assignée
            user.examSubject = undefined; // Optionnel : nettoyer le PDF après la session
            await user.save();

            console.log(`Utilisateur ${user.email} mis à jour en 'awaiting_appointment'.`);
        }
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'utilisateur ${user.email}:`, error);
    }
}
