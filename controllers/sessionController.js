import Session from '../models/sessionModel.js';

const SessionController = {
    // Créer une nouvelle session
    async createSession(req, res) {
        try {
            const { name, startDate, endDate } = req.body;
            const newSession = new Session({ name, startDate, endDate });
            await newSession.save();
            res.status(201).json({ message: 'Session créée avec succès', session: newSession });
        } catch (error) {
            console.error('Erreur lors de la création de la session :', error);
            res.status(500).json({ message: 'Erreur lors de la création de la session', error });
        }
    },

    // Récupérer toutes les sessions
    async getSessions(req, res) {
        try {
            const sessions = await Session.find();
            res.status(200).json(sessions);
        } catch (error) {
            console.error('Erreur lors de la récupération des sessions :', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des sessions', error });
        }
    },

    // Récupérer une session par ID
    async getSession(req, res) {
        try {
            const session = await Session.findById(req.params.id);
            if (!session) {
                return res.status(404).json({ message: 'Session non trouvée' });
            }
            res.status(200).json(session);
        } catch (error) {
            console.error('Erreur lors de la récupération de la session :', error);
            res.status(500).json({ message: 'Erreur lors de la récupération de la session', error });
        }
    },

    // Mettre à jour une session
    async updateSession(req, res) {
        try {
            const { name, startDate, endDate } = req.body;
            const session = await Session.findByIdAndUpdate(req.params.id, { name, startDate, endDate }, { new: true });
            if (!session) {
                return res.status(404).json({ message: 'Session non trouvée' });
            }
            res.status(200).json({ message: 'Session mise à jour avec succès', session });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la session :', error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour de la session', error });
        }
    },

    // Supprimer une session
    async deleteSession(req, res) {
        try {
            const session = await Session.findByIdAndDelete(req.params.id);
            if (!session) {
                return res.status(404).json({ message: 'Session non trouvée' });
            }
            res.status(200).json({ message: 'Session supprimée avec succès' });
        } catch (error) {
            console.error('Erreur lors de la suppression de la session :', error);
            res.status(500).json({ message: 'Erreur lors de la suppression de la session', error });
        }
    },
};

export default SessionController;