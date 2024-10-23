import Grade from '../models/gradeModel.js';
import Formation from '../models/formationModel.js';
import Exercise from "../models/exerciseModel.js";

const GradeController = {
    async generateExam(req, res) {
        try {
            const grade = await Grade.findById(req.params.id).populate('topics');
            if (!grade) {
                return res.status(404).json({ message: 'Grade not found' });
            }

            const doc = new PDFDocument();
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const pdf = Buffer.concat(chunks);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=exam.pdf');
                res.send(pdf);
            });

            for (const topic of grade.topics) {
                const exercises = await Exercise.find({ topicId: topic._id });
                if (exercises.length > 0) {
                    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
                    doc.addPage().fontSize(16).text(`Topic: ${topic.title}`, { underline: true });
                    doc.moveDown().fontSize(12).text(`Exercise: ${randomExercise.title}`);
                    doc.moveDown().fontSize(10).text(randomExercise.text);
                }
            }

            doc.end();
        } catch (error) {
            console.error('Error generating exam:', error);
            res.status(500).json({ message: 'Error generating exam', error });
        }
    },
    
    async createGrade(req, res) {
        try {
            const formation = await Formation.findById(req.body.formationId);
            if (!formation) {
                return res.status(404).json({ message: 'Formation not found' });
            }

            const grade = new Grade(req.body);
            await grade.save();
            res.status(201).json({ message: 'Grade created successfully!', grade });
        } catch (error) {
            console.error('Error creating grade:', error);
            res.status(500).json({ message: 'Error creating grade', error });
        }
    },

    async getGrades(req, res) {
        try {
            const grades = await Grade.find({ formationId: req.query.formationId }).populate('topics');
            res.status(200).json(grades);
        } catch (error) {
            console.error('Error fetching grades:', error);
            res.status(500).json({ message: 'Error fetching grades', error });
        }
    },

    async getGrade(req, res) {
        try {
            const grade = await Grade.findById(req.params.id).populate('topics');
            if (!grade) {
                return res.status(404).json({ message: 'Grade not found' });
            }
            res.status(200).json(grade);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching grade', error });
        }
    },

    async updateGrade(req, res) {
        try {
            const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('topics');
            if (!grade) {
                return res.status(404).json({ message: 'Grade not found' });
            }
            res.status(200).json({ message: 'Grade updated successfully', grade });
        } catch (error) {
            res.status(500).json({ message: 'Error updating grade', error });
        }
    },

    async deleteGrade(req, res) {
        try {
            const grade = await Grade.findByIdAndDelete(req.params.id);
            if (!grade) {
                return res.status(404).json({ message: 'Grade not found' });
            }
            res.status(200).json({ message: 'Grade deleted successfully' });
        } catch (error) {
            console.error('Error deleting grade:', error);
            res.status(500).json({ message: 'Error deleting grade', error });
        }
    }
};

export default GradeController;