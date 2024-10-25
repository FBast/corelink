import PDFDocument from 'pdfkit';
import Exercise from "../models/exerciseModel.js";

export const generateExamPDF = async (grade) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Vérifier si le grade existe
            if (!grade) {
                return reject(new Error('Grade not found'));
            }

            // Création du document PDF
            const doc = new PDFDocument();
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                const pdfBase64 = pdfBuffer.toString('base64');
                resolve(pdfBase64);
            });

            // Génération du contenu pour chaque topic et exercice
            for (const topic of grade.topics) {
                const exercises = await Exercise.find({ topicId: topic._id });
                if (exercises.length > 0) {
                    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];

                    // Ajouter le titre du topic
                    doc.fontSize(16)
                        .text(`Topic: ${topic.title}`, { underline: true });

                    // Ajouter un espace
                    doc.moveDown(0.5);

                    // Ajouter le titre de l'exercice
                    doc.fontSize(12)
                        .text(`Exercise: ${randomExercise.title}`);

                    // Ajouter un espace
                    doc.moveDown(0.5);

                    // Ajouter le texte de l'exercice
                    doc.fontSize(10)
                        .text(randomExercise.text);

                    // Ajouter un espace entre les sections
                    doc.moveDown(2);
                }
            }

            // Finir le document PDF
            doc.end();
        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(error);
        }
    });
};
