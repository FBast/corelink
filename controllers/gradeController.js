import Grade from '../models/gradeModel.js';
import Formation from '../models/formationModel.js';
import {generateExamPDF} from "../utils/pdfGenerator.js";

const GradeController = {
    async generateExam(req, res) {
        try {
            // Récupération du grade en fonction de l'ID fourni
            const grade = await Grade.findById(req.params.id).populate('topics');
            if (!grade) {
                return res.status(404).json({ message: 'Grade not found' });
            }

            // Appeler la fonction utilitaire pour générer le PDF
            const pdfBase64 = await generateExamPDF(grade);

            // Envoyer le PDF encodé en base64 dans la réponse JSON
            res.status(200).json({ pdf: pdfBase64 });
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
            const filter = req.query.formationId ? { formationId: req.query.formationId } : {};
            const grades = await Grade.find(filter);
            res.status(200).json(grades);
        } catch (error) {
            console.error('Error fetching grades:', error);
            res.status(500).json({ message: 'Error fetching grades', error });
        }
    },

    async getGrade(req, res) {
        try {
            const grade = await Grade.findById(req.params.id);
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
            const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
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