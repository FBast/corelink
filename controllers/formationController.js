import Formation from '../models/formationModel.js';
import Grade from '../models/gradeModel.js';

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

            // Delete all grades associated with this formation
            await Grade.deleteMany({ formationId: formation._id });

            // Delete the formation
            await Formation.findByIdAndDelete(req.params.id);

            res.status(200).json({ message: 'Formation and associated grades deleted successfully' });
        } catch (error) {
            console.error('Error deleting formation and grades:', error);
            res.status(500).json({ message: 'Error deleting the formation and its grades', error });
        }
    }
};

export default FormationController;