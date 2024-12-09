import Grade from '../models/gradeModel.js';
import Formation from '../models/formationModel.js';

const GradeController = {
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