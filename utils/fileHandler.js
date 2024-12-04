import PDFDocument from 'pdfkit';
import Topic from '../models/topicModel.js';
import archiver from 'archiver';
import { Readable } from 'stream';

export const generateExamPDF = async (grade) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Vérifier si le grade contient des topics
            if (!grade || !grade.topics || grade.topics.length === 0) {
                return reject(new Error('No topics associated with this grade'));
            }

            // Récupérer les topics à partir de leurs IDs
            const topics = await Topic.find({ _id: { $in: grade.topics } });
            if (!topics || topics.length === 0) {
                return reject(new Error('No valid topics found for this grade'));
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

            // Générer le contenu pour chaque topic et ses exercices
            for (const topic of topics) {
                if (topic.exercises && topic.exercises.length > 0) {
                    const randomExercise =
                        topic.exercises[Math.floor(Math.random() * topic.exercises.length)];

                    // Ajouter le titre du topic
                    doc.fontSize(16)
                        .text(`Sujet: ${topic.title}`, { underline: true });

                    // Ajouter un espace
                    doc.moveDown(0.5);

                    // Ajouter le titre de l'exercice
                    doc.fontSize(12)
                        .text(`Exercice: ${randomExercise.title}`);

                    // Ajouter un espace
                    doc.moveDown(0.5);

                    // Ajouter le texte de l'exercice
                    doc.fontSize(10)
                        .text(randomExercise.text);

                    // Ajouter un espace entre les sections
                    doc.moveDown(2);
                }
            }

            // Terminer le document PDF
            doc.end();
        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(error);
        }
    });
};

export const createZip = async (files) => {
    return new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const buffers = [];

        archive.on('data', (data) => buffers.push(data));
        archive.on('end', () => resolve(Buffer.concat(buffers)));
        archive.on('error', (err) => reject(err));

        files.forEach((file) => {
            const stream = Readable.from(file.data);
            archive.append(stream, { name: file.originalName });
        });

        archive.finalize();
    });
}