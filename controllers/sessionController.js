import Session from '../models/sessionModel.js';

const SessionController = {
    // Create a new session
    async createSession(req, res) {
        try {
            const newSession = new Session(req.body);
            await newSession.save();
            res.status(201).json({ message: 'Session successfully created', session: newSession });
        } catch (error) {
            console.error('Error creating session:', error);
            res.status(500).json({ message: 'Error creating session', error });
        }
    },

    // Retrieve all sessions
    async getSessions(req, res) {
        try {
            const sessions = await Session.find();
            res.status(200).json(sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            res.status(500).json({ message: 'Error fetching sessions', error });
        }
    },

    // Retrieve a session by ID
    async getSession(req, res) {
        try {
            const session = await Session.findById(req.params.id);
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }
            res.status(200).json(session);
        } catch (error) {
            console.error('Error fetching session:', error);
            res.status(500).json({ message: 'Error fetching session', error });
        }
    },

    // Update a session
    async updateSession(req, res) {
        try {
            const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }
            res.status(200).json({ message: 'Session successfully updated', session });
        } catch (error) {
            console.error('Error updating session:', error);
            res.status(500).json({ message: 'Error updating session', error });
        }
    },

    // Delete a session
    async deleteSession(req, res) {
        try {
            const session = await Session.findByIdAndDelete(req.params.id);
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }
            res.status(200).json({ message: 'Session successfully deleted' });
        } catch (error) {
            console.error('Error deleting session:', error);
            res.status(500).json({ message: 'Error deleting session', error });
        }
    },
};

export default SessionController;