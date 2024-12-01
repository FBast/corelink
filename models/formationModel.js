import mongoose from 'mongoose';
import {gradeSchema} from "./gradeModel.js";

const formationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    grades: [gradeSchema]
}, { timestamps: true });

const Formation = mongoose.model('Formation', formationSchema);

export default Formation;