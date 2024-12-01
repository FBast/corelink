import Exercise from '../models/exerciseModel.js';

const ExerciseController = {
    async createExercise(req, res) {
        try {
            const exercise = new Exercise(req.body);
            await exercise.save();

            res.status(201).json({
                message: 'Exercise successfully created',
                exercise: exercise,
            });
        } catch (error) {
            console.error('Error creating exercise:', error);
            res.status(500).json({ message: 'Error creating exercise', error });
        }
    },

    async getExercises(req, res) {
        try {
            const filters = {};
            const exercises = await Exercise.find(filters);

            res.status(200).json(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            res.status(500).json({ message: 'Error fetching exercises', error });
        }
    },

    async getExercise(req, res) {
        try {
            const exercise = await Exercise.findById(req.params.id);
            if (!exercise) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            res.status(200).json(exercise);
        } catch (error) {
            console.error('Error fetching exercise:', error);
            res.status(500).json({ message: 'Error fetching exercise', error });
        }
    },

    async updateExercise(req, res) {
        try {
            const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!exercise) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            res.status(200).json({
                message: 'Exercise successfully updated',
                exercise: exercise,
            });
        } catch (error) {
            console.error('Error updating exercise:', error);
            res.status(500).json({ message: 'Error updating exercise', error });
        }
    },

    async deleteExercise(req, res) {
        try {
            const exercise = await Exercise.findByIdAndDelete(req.params.id);
            if (!exercise) {
                return res.status(404).json({ message: 'Exercise not found' });
            }

            res.status(200).json({ message: 'Exercise successfully deleted' });
        } catch (error) {
            console.error('Error deleting exercise:', error);
            res.status(500).json({ message: 'Error deleting exercise', error });
        }
    },
};

export default ExerciseController;