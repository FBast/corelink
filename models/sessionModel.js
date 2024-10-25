import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
