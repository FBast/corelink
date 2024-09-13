const jwt = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé. Aucun token fourni.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Ajoute tout le payload décodé (y compris le rôle) dans req.user

        // Si le token est valide, passe au middleware suivant
        next();
    } catch (error) {
        console.error("Erreur lors de la vérification JWT :", error);
        return res.status(401).json({ message: 'Token invalide ou expiré', error: error.message });
    }
};

module.exports = jwtAuth;
