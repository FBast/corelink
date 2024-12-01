import Topic from '../models/topicModel.js';

const TopicController = {
    // Create a new topic with optional exercises
    async createTopic(req, res) {
        try {
            const topicData = req.body; // Includes "exercises" if provided
            const topic = new Topic(topicData);
            await topic.save();
            res.status(201).json({ message: 'Topic created successfully!', topic });
        } catch (error) {
            console.error('Error creating topic:', error);
            res.status(500).json({ message: 'Error creating topic', error });
        }
    },

    // Retrieve all topics along with their exercises
    async getTopics(req, res) {
        try {
            const topics = await Topic.find(); // Exercises are embedded in the topics
            res.status(200).json(topics);
        } catch (error) {
            console.error('Error fetching topics:', error);
            res.status(500).json({ message: 'Error fetching topics', error });
        }
    },

    // Retrieve a single topic by its ID
    async getTopic(req, res) {
        try {
            const topicId = req.params.id;
            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }
            res.status(200).json(topic);
        } catch (error) {
            console.error('Error fetching topic:', error);
            res.status(500).json({ message: 'Error fetching topic', error });
        }
    },

    // Update a topic and its exercises
    async updateTopic(req, res) {
        try {
            const topicId = req.params.id;
            const updatedData = req.body; // May include changes to exercises

            const topic = await Topic.findByIdAndUpdate(topicId, updatedData, { new: true });
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }

            res.status(200).json({ message: 'Topic updated successfully', topic });
        } catch (error) {
            console.error('Error updating topic:', error);
            res.status(500).json({ message: 'Error updating topic', error });
        }
    },

    // Delete a topic and all its embedded exercises
    async deleteTopic(req, res) {
        try {
            const topicId = req.params.id;
            const topic = await Topic.findByIdAndDelete(topicId);
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }

            res.status(200).json({ message: 'Topic deleted successfully', topic });
        } catch (error) {
            console.error('Error deleting topic:', error);
            res.status(500).json({ message: 'Error deleting topic', error });
        }
    },

    // Add an exercise to a specific topic
    async addExercise(req, res) {
        try {
            const topicId = req.params.id;
            const exercise = req.body;

            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }

            topic.exercises.push(exercise); // Add the exercise to the embedded array
            await topic.save();

            res.status(201).json({ message: 'Exercise added successfully', topic });
        } catch (error) {
            console.error('Error adding exercise:', error);
            res.status(500).json({ message: 'Error adding exercise', error });
        }
    },

    // Delete a specific exercise from a topic
    async deleteExercise(req, res) {
        try {
            const topicId = req.params.topicId;
            const exerciseId = req.params.exerciseId;

            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ message: 'Topic not found' });
            }

            topic.exercises = topic.exercises.filter(e => e._id.toString() !== exerciseId); // Remove the exercise
            await topic.save();

            res.status(200).json({ message: 'Exercise deleted successfully', topic });
        } catch (error) {
            console.error('Error deleting exercise:', error);
            res.status(500).json({ message: 'Error deleting exercise', error });
        }
    },

    // Generate exam endpoint (placeholder, not yet implemented)
    async generateExam(req, res) {
        res.status(501).json({ message: 'This feature is not implemented yet' });
    }
};

export default TopicController;