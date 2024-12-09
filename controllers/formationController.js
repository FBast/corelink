import Formation from '../models/formationModel.js';
import {generateExamPDF} from "../utils/pdfGenerator.js";

const FormationController = {
    async createFormation(req, res) {
        try {
            const formation = new Formation(req.body);
            await formation.save();
            res.status(201).json({ message: 'Formation created successfully!', formation });
        } catch (error) {
            console.error('Error creating formation:', error);
            res.status(500).json({ message: 'Error creating formation', error });
        }
    },

    async getFormations(req, res) {
        try {
            const formations = await Formation.find();
            res.status(200).json(formations);
        } catch (error) {
            console.error('Error fetching formations:', error);
            res.status(500).json({ message: 'Error fetching formations', error });
        }
    },

    async getFormation(req, res) {
        try {
            const formation = await Formation.findById(req.params.id);
            if (!formation) {
                return res.status(404).json({ message: 'Formation not found' });
            }
            res.status(200).json(formation);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching formation', error });
        }
    },

    async updateFormation(req, res) {
        try {
            const formation = await Formation.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!formation) {
                return res.status(404).json({ message: 'Formation not found' });
            }
            res.status(200).json({ message: 'Formation updated successfully', formation });
        } catch (error) {
            res.status(500).json({ message: 'Error updating formation', error });
        }
    },

    async deleteFormation(req, res) {
        try {
            // Find the formation to delete
            const formation = await Formation.findById(req.params.id);
            if (!formation) {
                return res.status(404).json({ message: 'Formation not found' });
            }

            // Delete the formation
            await Formation.findByIdAndDelete(req.params.id);

            res.status(200).json({ message: 'Formation and associated grades deleted successfully' });
        } catch (error) {
            console.error('Error deleting formation and grades:', error);
            res.status(500).json({ message: 'Error deleting the formation and its grades', error });
        }
    },

    async generateExam(req, res) {
        try {
            // Récupération de la formation en fonction de l'ID fourni
            const formation = await Formation.findById(req.params.formationId);
            if (!formation) {
                return res.status(404).json({ message: 'Formation not found' });
            }

            // Récupération du grade en fonction de l'ID fourni
            const grade = formation.grades.find((grade) => grade.id === req.params.gradeId);
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
};

export default FormationController;