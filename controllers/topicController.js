import Topic from '../models/topicModel.js';

const TopicController = {
    async createTopic(req, res) {
        try {
            const topic = new Topic(req.body);
            await topic.save();
            res.status(201).json({ message: 'Sujet créé avec succès !', topic: topic });
        } catch (error) {
            console.error('Erreur lors de la création du sujet :', error);
            res.status(500).json({ message: 'Erreur lors de la création du sujet', error });
        }
    },

    async getTopics(req, res) {
        try {
            const topics = await Topic.find();
            res.status(200).json(topics);
        } catch (error) {
            console.error('Erreur lors de la récupération des sujets :', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des sujets', error });
        }
    },

    async getTopic(req, res) {
        try {
            const topic = await Topic.findById(req.params.id);
            if (!topic) {
                return res.status(404).json({ message: 'Sujet non trouvé' });
            }
            res.status(200).json(topic);
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la récupération du sujet', error });
        }
    },

    async updateTopic(req, res) {
        try {
            const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!topic) {
                return res.status(404).json({ message: 'Sujet non trouvé' });
            }
            res.status(200).json({ message: 'Sujet mis à jour avec succès', topic: topic });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour du sujet', error });
        }
    },

    async deleteTopic(req, res) {
        try {
            const topic = await Topic.findByIdAndDelete(req.params.id);
            if (!topic) {
                return res.status(404).json({ message: 'Sujet non trouvé' });
            }
            res.status(200).json({ message: 'Sujet supprimé avec succès' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la suppression du sujet', error });
        }
    },
    
    async generateExam(req, res) {
        return res.status(501);
    }
};

export default TopicController;
