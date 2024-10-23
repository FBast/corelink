import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
    grade: {
        type: String,
        required: true
    },
    formationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Formation',
        required: true
    },
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    }]
}, { timestamps: true });

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;