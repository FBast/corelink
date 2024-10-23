import Exercise from '../models/exerciseModel.js';
import Topic from "../models/topicModel.js";

const ExerciseController = {
    async createExercise(req, res) {
        try {
            const exercise = new Exercise(req.body);
            await exercise.save();

            const topic = await Topic.findByIdAndUpdate(
                req.body.topicId,
                { $push: { exercises: exercise._id } },
                { new: true }
            );

            if (!topic) {
                return res.status(404).json({ message: 'Sujet non trouvé' });
            }

            res.status(201).json({
                message: 'Exercice créé et ajouté au sujet avec succès !',
                exercise: exercise,
                topic: topic
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'exercice :', error);
            res.status(500).json({ message: 'Erreur lors de la création de l\'exercice', error });
        }
    },

    async getExercises(req, res) {
        try {
            const filters = {};
            if (req.query.topicId) {
                filters.topicId = req.query.topicId;
            }

            const exercises = await Exercise.find(filters);
            res.status(200).json(exercises);
        } catch (error) {
            console.error('Erreur lors de la récupération des exercices :', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des exercices', error });
        }
    },

    async getExercise(req, res) {
        try {
            const exercise = await Exercise.findById(req.params.id);
            if (!exercise) {
                return res.status(404).json({ message: 'Exercice non trouvé' });
            }
            res.status(200).json(exercise);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'exercice', error });
        }
    },

    async updateExercise(req, res) {
        try {
            const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!exercise) {
                return res.status(404).json({ message: 'Exercice non trouvé' });
            }
            res.status(200).json({ message: 'Exercice mis à jour avec succès', exercise: exercise });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'exercice', error });
        }
    },

    async deleteExercise(req, res) {
        try {
            const exercise = await Exercise.findByIdAndDelete(req.params.id);
            if (!exercise) {
                return res.status(404).json({ message: 'Exercice non trouvé' });
            }
            res.status(200).json({ message: 'Exercice supprimé avec succès' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la suppression de l\'exercice', error });
        }
    },
};

export default ExerciseController;