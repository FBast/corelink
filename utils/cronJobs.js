import moment from 'moment';
import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";
import Formation from "../models/formationModel.js";
import { sendEmail } from "./emailService.js";
import { generateExamPDF } from "./pdfGenerator.js";

// Fonction principale pour gérer les tâches planifiées
export async function processCronJobs() {
    console.log('Passe du traitement des tâches planifiées...');
    try {
        await processAwaitingSessionUsers();
        await processAwaitingAppointmentUsers();
        await processAwaitingInterviewUsers();
        await processAwaitingDecisionUsers();
    } catch (error) {
        console.error('Erreur lors de l\'exécution des tâches planifiées :', error);
    }
}

// Traitement des utilisateurs en `awaiting_session`
async function processAwaitingSessionUsers() {
    const now = new Date();

    try {
        // Récupère les sessions en cours
        const ongoingSessions = await Session.find({
            startDate: { $lte: now },
            endDate: { $gte: now },
        });

        if (ongoingSessions.length === 0) {
            return;
        }

        const users = await User.find({ status: 'awaiting_session' });
        if (users.length === 0) {
            return;
        }

        for (const user of users) {
            const session = ongoingSessions[0]; // Utilisation de la première session en cours
            await startExamForUser(user, session);
        }
    } catch (error) {
        console.error('Erreur lors du traitement des utilisateurs en attente de session :', error);
    }
}

// Démarre l'examen pour un utilisateur
async function startExamForUser(user, session) {
    try {
        // Rechercher la formation et le grade
        const formation = await Formation.findById(user.requestedFormation);
        if (!formation) {
            console.error(`Formation introuvable pour l'utilisateur ${user.email}`);
            return;
        }

        const grade = formation.grades.find(grade => grade._id.toString() === user.requestedGrade);
        if (!grade) {
            console.error(`Grade introuvable dans la formation ${formation.title} pour l'utilisateur ${user.email}`);
            return;
        }

        // Génération du PDF de l'examen
        const pdfBase64 = await generateExamPDF(grade);
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        // Envoi de l'email avec l'examen
        const date = new Date().toISOString().slice(0, 10)
        await sendEmail(
            user.email,
            `Votre épreuve pour l'ENSI commence !`,
            `Bonjour ${user.firstName},\n\nVotre épreuve pour la session "${session.name}" commence maintenant (${moment(session.startDate).format('LLL')}).\n\nVeuillez trouver ci-joint l'examen correspondant. Assurez-vous de déposer votre rendu avant la fin de la session (${moment(session.endDate).format('LLL')}).\n\nBonne chance !`,
            [
                {
                    filename: `${user.firstName}_${user.lastName}_Examen_${date}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ]
        );

        // Mise à jour de l'utilisateur
        user.status = 'exam_in_progress';
        user.examSubject = pdfBuffer; // Sauvegarde du PDF
        await user.save();

        console.log(`Notification envoyée à ${user.email} pour le démarrage de l'examen.`);
    } catch (error) {
        console.error(`Erreur lors du démarrage de l'examen pour ${user.email}:`, error);
    }
}

// Traitement des utilisateurs en `awaiting_appointment`
async function processAwaitingAppointmentUsers() {
    try {
        // Récupérer les utilisateurs en `awaiting_appointment` avec une date de rendez-vous
        const users = await User.find({
            status: 'awaiting_appointment',
            meetingDate: { $exists: true, $ne: null },
        });

        if (users.length === 0) {
            return;
        }

        for (const user of users) {
            await notifyUserOfAppointment(user);
        }
    } catch (error) {
        console.error('Erreur lors du traitement des utilisateurs en attente de rendez-vous :', error);
    }
}

// Notifier l'utilisateur de son rendez-vous et mettre à jour son statut
async function notifyUserOfAppointment(user) {
    try {
        if (!user.meetingDate) {
            console.error(`Utilisateur ${user.email} n'a pas de date de rendez-vous.`);
            return;
        }

        // Envoi de l'email avec la date du rendez-vous
        await sendEmail(
            user.email,
            `Votre rendez-vous pour l'entretien ENSI`,
            `Bonjour ${user.firstName},\n\nNous vous confirmons votre rendez-vous pour l'entretien.\n\nDate : ${moment(user.meetingDate).format('LLL')}\n\nMerci de vous connecter à la plateforme à l'heure prévue.\n\nCordialement, L'équipe ENSI`
        );

        // Mise à jour de l'utilisateur
        user.status = 'awaiting_interview';
        await user.save();

        console.log(`Notification envoyée à ${user.email} pour le rendez-vous.`);
    } catch (error) {
        console.error(`Erreur lors de la notification pour ${user.email}:`, error);
    }
}

// Traitement des utilisateurs en `awaiting_interview`
async function processAwaitingInterviewUsers() {
    const now = new Date();

    try {
        // Trouver les utilisateurs dont l'entretien est dans le passé
        const users = await User.find({
            status: 'awaiting_interview',
            meetingDate: { $lte: now },
        });

        if (users.length === 0) {
            return;
        }

        for (const user of users) {
            // Mettre à jour le statut de l'utilisateur
            user.status = 'awaiting_decision';
            await user.save();

            console.log(`Utilisateur ${user.email} mis à jour en 'awaiting_decision'.`);
        }
    } catch (error) {
        console.error('Erreur lors du traitement des utilisateurs en awaiting_interview :', error);
    }
}

// Traitement des utilisateurs en `awaiting_decision`
export async function processAwaitingDecisionUsers() {
    try {
        // Récupérer les utilisateurs en attente de décision avec une décision définie
        const users = await User.find({
            status: "awaiting_decision",
            decision: { $exists: true, $ne: null },
        });

        if (users.length === 0) {
            return;
        }

        for (const user of users) {
            await handleDecisionForUser(user);
        }
    } catch (error) {
        console.error("Erreur lors du traitement des utilisateurs en attente de décision :", error);
    }
}

// Gère la décision pour un utilisateur
async function handleDecisionForUser(user) {
    try {
        let emailSubject, emailBody;

        // Générer le contenu de l'email en fonction de la décision
        switch (user.decision) {
            case "accepted":
                emailSubject = "Votre candidature a été acceptée !";
                emailBody = `Bonjour ${user.firstName},\n\nNous avons le plaisir de vous informer que votre candidature a été acceptée. Bienvenue à l'ENSI ! Vous recevrez bientôt des informations supplémentaires concernant les prochaines étapes.\n\nCordialement,\nL'équipe ENSI`;
                user.status = "accepted";
                break;

            case "rejected":
                emailSubject = "Votre candidature n'a pas été retenue";
                emailBody = `Bonjour ${user.firstName},\n\nAprès examen approfondi, nous regrettons de vous informer que votre candidature n'a pas été retenue. Nous vous remercions pour l'intérêt porté à l'ENSI et vous souhaitons le meilleur pour vos futurs projets.\n\nCordialement,\nL'équipe ENSI`;
                user.status = "rejected";
                break;

            case "waitlisted":
                emailSubject = "Votre candidature est sur liste d'attente";
                emailBody = `Bonjour ${user.firstName},\n\nVotre candidature a été placée sur liste d'attente. Si une place se libère, nous vous en informerons dans les plus brefs délais. Nous vous remercions pour votre patience et votre intérêt pour l'ENSI.\n\nCordialement,\nL'équipe ENSI`;
                user.status = "waitlisted";
                break;

            default:
                console.error(`Décision inconnue pour l'utilisateur ${user.email}`);
                return;
        }

        // Envoyer l'email
        await sendEmail(user.email, emailSubject, emailBody);

        // Mettre à jour le statut de l'utilisateur
        user.status = 'application_processed';
        await user.save();

        console.log(`Notification envoyée à ${user.email} pour la décision ${user.decision}.`);
    } catch (error) {
        console.error(`Erreur lors du traitement de la décision pour ${user.email}:`, error);
    }
}