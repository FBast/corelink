import mongoose from 'mongoose';

export const exerciseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    images: [
        {
            data: {
                type: Buffer,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            mimeType: {
                type: String,
                required: true,
            },
        },
    ],
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;
