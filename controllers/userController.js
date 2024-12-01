import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { sendEmail, sendVerificationCode } from "../utils/emailService.js";
import bcrypt from "bcrypt";

const UserController = {
    // Resend verification code to the user's email
    async resendVerificationCode(req, res) {
        try {
            const { email } = req.body;

            // Find the user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Check if the user is already verified
            if (user.status === "awaiting_information") {
                return res.status(400).json({ message: 'This account is already verified.' });
            }

            // Send the verification code
            await sendVerificationCode(user);

            res.status(200).json({ message: 'Verification code resent successfully.' });
        } catch (error) {
            console.error('Error resending the verification code:', error);
            res.status(500).json({ message: 'Error resending the verification code' });
        }
    },

    // Create a new user and send a verification code
    async createUser(req, res) {
        try {
            const { email, password } = req.body;

            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'This email is already in use.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                email,
                password: hashedPassword,
                isVerified: false,
            });
            await newUser.save();

            // Send the verification code
            await sendVerificationCode(newUser);

            res.status(201).json({ message: 'User created successfully! Check your email to verify your account.' });
        } catch (error) {
            console.error('Error creating the user:', error);
            res.status(500).json({ message: 'Error creating the user' });
        }
    },

    // Verify the user's account
    async verifyUser(req, res) {
        try {
            const { email, token } = req.body;

            // Find the user by email and validation token
            const user = await User.findOne({ email, validationToken: token });
            if (!user) {
                return res.status(400).json({ message: 'Invalid validation code or user not found.' });
            }

            // Update user status and clear validation token
            user.status = 'awaiting_information';
            user.validationToken = undefined;

            const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({
                message: 'Account successfully verified!',
                token: authToken,
            });

            await user.save();
        } catch (error) {
            res.status(500).json({ message: 'Error verifying the account', error });
        }
    },

    // Log in the user and return a JWT token
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            // Find the user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check if the password is correct
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: "Incorrect password" });
            }

            // Generate JWT token
            const token = jwt.sign({
                userId: user._id,
                role: user.role,
                status: user.status,
            }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.cookie('token', token, { httpOnly: true, secure: true });
            res.status(200).json({ message: 'Login successful!', token, status: user.status });
        } catch (error) {
            res.status(500).json({ message: "Error during login", error });
        }
    },

    // Request a password reset and send a validation code to the user's email
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            const validationToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

            // Find the user by email and update the validation token
            const user = await User.findOneAndUpdate({ email }, { validationToken }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Send email with validation code
            const subject = 'Password Reset';
            const text = `You requested a password reset. 
            Your validation code is: ${validationToken}. 
            Please enter it on our website to reset your password.`;
            await sendEmail(email, subject, text);

            res.status(201).json({ message: 'Password reset initiated. Check your email to proceed.' });
        } catch (error) {
            console.error('Error during password reset:', error);
            res.status(500).json({ message: 'Error during password reset', error });
        }
    },

    // Reset the user's password using a validation token
    async resetPassword(req, res) {
        try {
            const { email, validationToken, newPassword } = req.body;

            // Find the user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if the validation token matches
            if (user.validationToken !== validationToken) {
                return res.status(400).json({ message: 'Invalid validation code' });
            }

            // Check if token expired
            if (user.validationTokenExpires && user.validationTokenExpires < Date.now()) {
                return res.status(400).json({ message: 'Validation code expired' });
            }

            // Hash the new password and update the user
            user.password = await bcrypt.hash(newPassword, 10);
            user.validationToken = undefined;

            await user.save();
            res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Error resetting password', error });
        }
    },

    // Get the user's profile based on their token
    async getUserProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving user profile', error });
        }
    },

    // Update the user's profile
    async updateUserProfile(req, res) {
        try {
            const userId = req.user.userId;

            if (req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

            const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error updating user profile', error });
        }
    },

    // Upload an exam report for the user
    async uploadExamReport(req, res) {
        try {
            const userId = req.user.userId;

            if (!req.file) {
                return res.status(400).json({ message: 'No PDF file provided.' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.examReport = req.file.buffer;
            await user.save();
            res.status(200).json({ message: 'PDF file uploaded successfully.' });
        } catch (error) {
            console.error('Error uploading PDF file:', error);
            res.status(500).json({ message: 'Error uploading PDF file', error });
        }
    },

    // Get all users
    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Error fetching users', error });
        }
    },

    // Get a single user by ID
    async getUser(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user', error });
        }
    },

    // Update a user by ID
    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const data = req.body;

            // Check for password changes and hash if necessary
            if (data.password) {
                data.password = await bcrypt.hash(data.password, 10);
            }

            const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Error updating user', error });
        }
    },

    // Delete a user by ID
    async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error });
        }
    },
};

export default UserController;