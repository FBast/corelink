import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    },
    status: {
        type: String,
        default: 'unverified',
        required: true
    },
    validationToken: {
        type: String,
        required: false,
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    birthDate: {
        type: Date
    },
    requestedFormation: {
        type: String
    },
    requestedGrade: {
        type: String
    },
    evaluation: {
        type: String
    },
    meetingDate: {
        type: Date
    },
    examSubject: {
        type: Buffer
    },
    examReport: {
        type: Buffer
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;