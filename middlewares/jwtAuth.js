import jwt from 'jsonwebtoken';

const jwtAuth = (req, res, next) => {
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé. Aucun token fourni.' });
    }

    try {
        // Ajoute tout le payload décodé dans req.user
        req.user = jwt.verify(token, process.env.JWT_SECRET);

        // Si le token est valide, passe au middleware suivant
        next();
    } catch (error) {
        console.error("Erreur lors de la vérification JWT :", error);
        return res.status(401).json({ message: 'Token invalide ou expiré', error: error.message });
    }
};

export default jwtAuth;
