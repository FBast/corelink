import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    }
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;
