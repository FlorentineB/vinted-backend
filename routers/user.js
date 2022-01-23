const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const router = express.Router();

const User = require("../Models/User");

// Route pour signup || POST donc req.fields || body : mail, username, phone, password
router.post("/user/signup", async (req, res) => {
  try {
    const password = req.fields.password;
    // On crée les salt, hash et token
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);
    // On cherche si l'email rentré existe
    const emailSearch = await User.findOne({ email: req.fields.email });
    // Si le mail n'existe pas....
    if (!emailSearch) {
      // On vérifie qu'il y a bien un username de rentrer
      if (req.fields.username) {
        // Si username rentré, on crée le newUser
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
          },
          token: token,
          hash: hash,
          salt: salt,
        });
        // On enregistre le newUser
        await newUser.save();
        // On renvoie le newUser créé
        res.status(200).json({ newUser });
      } else {
        // S'il n'y pas de username rentré, on renvoie un message d'erreur
        res.status(400).json({ error: { message: "Username missing" } });
      }
    } else {
      // Si l'email existe déjà dans la BDD, on renvoie un message d'erreur
      res.status(400).json({ error: { message: "Email already exists" } });
    }
  } catch (error) {
    res.status(400).json({ message: { error: "Impossible to signup" } });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const userDemanded = await User.findOne({ email: req.fields.email });
    const salt = userDemanded.salt;
    const password = req.fields.password;
    const hash = SHA256(password + salt).toString(encBase64);
    if (hash === userDemanded.hash) {
      res
        .status(200)
        .json({ message: "Successfully connected", token: userDemanded.token });
    } else {
      res.status(400).json({ error: { message: "Unauthorized" } });
    }
  } catch (error) {
    res.status(400).json({ error: { message: "Impossible to connect" } });
  }
});

module.exports = router;
