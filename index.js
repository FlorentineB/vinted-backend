// Pour pouvoir cacher des fichiers : dotenv
require("dotenv").config();

// Import des packages
const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const mongoose = require("mongoose");
const SHA256 = require("crypto-js/sha256");
const uid2 = require("uid2");

// Appel des packages
const app = express();
app.use(formidable());
app.use(cors()); // Permet à n'importe quel front end d'appeler l'API et donc de la faire fonctionner

// Connection à Mongoose
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Installer cloudinary
const cloudinary = require("cloudinary").v2;

// Configuration cloudinary
cloudinary.config({
  cloud_name: "dhwnmvzu4",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import des routes
const signup = require("./routers/user");
app.use(signup);

const publish = require("./routers/offer");
app.use(publish);

// Routes qui n'existent pas
app.get("*", (req, res) => {
  res.status(404).json({ error: "page not found" });
});

// Démarrage du serveur
app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
