require("dotenv").config();
const jwt = require("jsonwebtoken");

class TokenGenerator {
    // Générer un access token
    generateAccessToken = (userId) => {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
    };

    // Générer un refresh token
    generateRefreshToken = (userId) => {
        return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "3d" });
    };

    // Rafraîchir un access token avec un refresh token
    refreshAccessToken = (refreshToken) => {
        return new Promise((resolve, reject) => {
            // Vérifier si un refresh token est présent
            if (!refreshToken) {
                return reject(new Error("Refresh token est manquant."));
            }

            // Vérifier le refresh token avec la clé secrète
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
                if (err) {
                    // Si le token est expiré, on rejette avec une erreur spécifique
                    if (err.name === "TokenExpiredError") {
                        return reject(new Error("Refresh token expiré"));
                    }
                    // Si l'erreur est autre qu'expirée, on renvoie une erreur générique
                    return reject(new Error("Refresh token invalide"));
                }

                // Si le refresh token est valide, on génère un nouveau access token
                const newAccessToken = this.generateAccessToken(decoded.id);
                resolve(newAccessToken); // Renvoi du nouveau access token
            });
        });
    };

    // Middleware pour vérifier le token
    verifyToken = (req, res, next) => {
        const token = req.headers["authorization"];
        if (!token) {
            return res.status(403).send({ message: "Token requis." });
        }

        const tokenParts = token.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            return res.status(401).send({ message: "Token non valide" });
        }

        jwt.verify(tokenParts[1], process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Token non valide." });
            }

            req.userId = decoded.id;
            next();
        });
    };
}

module.exports = TokenGenerator;
