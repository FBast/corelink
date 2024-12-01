import mongoose from 'mongoose';

export const gradeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }]
}, { timestamps: true });

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;