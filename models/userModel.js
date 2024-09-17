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
        enum: ['unverified', 'verified', 'waiting_exam'],
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
    birtDate: {
        type: Date
    },
    requestedFormation: {
        type: String
    },
    requestedYear: {
        type: Number
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;