import mongoose from 'mongoose';
import {exerciseSchema} from "./exerciseModel.js";

const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    exercises: [exerciseSchema]
}, { timestamps: true });

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;
