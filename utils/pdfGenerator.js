import PDFDocument from 'pdfkit';
import Topic from '../models/topicModel.js';

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
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                const pdfBase64 = pdfBuffer.toString('base64');
                resolve(pdfBase64);
            });

            // Titre Centré
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text("Ecole des Nouvelles Images", { align: 'center' });
            doc.moveDown(1);

            // Rappel du Grade
            doc.fontSize(16)
                .font('Helvetica')
                .text(`Epreuve pour le Grade : ${grade.title}`, { align: 'center' });
            doc.moveDown(1);

            // Descriptif Explicatif
            doc.fontSize(12)
                .font('Helvetica')
                .text(
                    "Cet examen est composé d'exercices aléatoires extraits des différents sujets associés à ce grade. Chaque exercice inclut du texte et des images pour vous guider dans vos réponses.",
                    { align: 'justify' }
                );
            doc.moveDown(2);

            // Générer le contenu pour chaque topic et ses exercices
            for (const topic of topics) {
                if (topic.exercises && topic.exercises.length > 0) {
                    const randomExercise = topic.exercises[Math.floor(Math.random() * topic.exercises.length)];

                    // Titre du topic
                    doc.fontSize(16)
                        .text(`Sujet: ${topic.title}`, { underline: true });
                    doc.moveDown(0.5);

                    // Titre de l'exercice
                    doc.fontSize(12)
                        .text(`Exercice: ${randomExercise.title}`);
                    doc.moveDown(0.5);

                    // Images associées à l'exercice
                    if (randomExercise.images && randomExercise.images.length > 0) {
                        for (const image of randomExercise.images) {
                            const imageBuffer = image.data
                                ? Buffer.from(image.data)
                                : Buffer.from(image);

                            // Vérifier que le buffer est valide avant d'ajouter l'image
                            if (imageBuffer) {
                                // Vérifie si assez d'espace reste sur la page, sinon passe à la suivante
                                if (doc.y + 300 > doc.page.height - doc.page.margins.bottom) {
                                    doc.addPage();
                                }

                                // Insérer l'image avec un placement ajusté
                                doc.image(imageBuffer, {
                                    fit: [doc.page.width - doc.page.margins.left - doc.page.margins.right, 300],
                                    align: 'center',
                                });

                                doc.moveDown(1); // Ajouter un espace après l'image
                            }
                        }
                    }

                    // Texte de l'exercice
                    doc.fontSize(10)
                        .text(randomExercise.text, { align: 'justify' });

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