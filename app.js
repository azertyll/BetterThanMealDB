const express = require("express");
const Router = require("./Security/router"); // Le routeur que tu as écrit
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require('multer');
const path = require("path");
require("dotenv").config();
const { createPool } = require("./Security/authDatabase");

const app = express();

const allowedOrigins = (process.env.VITE_APP_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

  const corsOptions = {
    origin: "*"
  };

app.use(cors(corsOptions)); // Ajout du middleware CORS
// app.options('/*', cors(corsOptions));

app.use(cookieParser());
app.set('trust proxy', 1);

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Middleware pour parser les requêtes encodées en URL (optionnel)
app.use(express.urlencoded({ extended: true }));


// Configurer Multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Répertoire où les images seront stockées
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // Renommer le fichier avec un nom unique
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  
  // Servir les fichiers statiques (les images) à partir du répertoire "uploads"
  app.use('/uploads', express.static('uploads'));

// Création du routeur
const router = new Router();
router.loadRoutes(); // Charge les routes à partir des contrôleurs

// Utiliser le routeur Express dans l'application
app.use("/", router.getRouter());

// Démarrer le serveur
const HOST = process.env.VITE_BACK_URL || "http://0.0.0.0";
const PORT = Number(process.env.BACK_PORT) || 666;


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Le serveur est lancé sur l'adresse suivante: ${HOST}`);
});

(async () => {
    try {
      await createPool();
      console.log("Connexion au service d'authentification MySQL établie.");
    } catch (err) {
      console.error("Impossible d'établir la connexion avec le service d'authentification :", err.message);
      process.exit(1);
    }
  })();
