﻿const mongoose = require('mongoose');

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
    status: {
        type: String, 
        enum: ['unverified', 'verified'],
        default: 'unverified',
        required: true
    },
    validationToken: {
        type: String, 
        required: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);