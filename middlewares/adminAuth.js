const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès interdit. Vous n\'êtes pas administrateur.' });
    }
    next();
};

module.exports = adminAuth;