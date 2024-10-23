import mongoose from 'mongoose';

const formationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Formation = mongoose.model('Formation', formationSchema);

export default Formation;