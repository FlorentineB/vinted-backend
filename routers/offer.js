const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

const User = require("../Models/User");
const Offer = require("../Models/Offer");
const { append } = require("vary");

cloudinary.config({
  cloud_name: "dhwnmvzu4",
  api_key: "742976138158497",
  api_secret: "XifpIAlQWGDsTRVnr-poKNUvHi4",
});

// Fonction pour authentifier via Token
const isAuthenticated = async (req, res, next) => {
  const isTokenValid = await User.findOne({
    token: req.headers.authorization.replace("Bearer ", ""),
  });
  console.log("here", isTokenValid);
  if (isTokenValid) {
    req.user = isTokenValid;
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Pour poster une annonce, avec une référence à son auteur et une authentification via bearer token || POST
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    let pictureToUpload = req.files.picture.path;
    const result = await cloudinary.uploader.upload(pictureToUpload);
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        {
          MARQUE: req.fields.brand,
        },
        {
          TAILLE: req.fields.size,
        },
        {
          ETAT: req.fields.condition,
        },
        {
          COULEUR: req.fields.color,
        },
        {
          EMPLACEMENT: req.fields.city,
        },
      ],
      owner: req.user,
      product_image: result,
    });
    await newOffer.save();
    res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Pour faire une recherche dans les annonces
router.get("/offers", isAuthenticated, async (req, res) => {
  try {
    if (
      req.query.title ||
      req.query.priceMin ||
      req.query.priceMax ||
      req.query.sort ||
      req.query.page
    ) {
      let filter = {};
      if (req.query.title) {
        const regexTitle = new RegExp(req.query.title, "i");
        filter.product_name = regexTitle;
      }
      if (req.query.priceMin || req.query.priceMax) {
        filter.product_price = {};
        if (req.query.priceMin) {
          filter.product_price.$gte = req.query.priceMin;
        }
        if (req.query.priceMax) {
          filter.product_price.$lte = req.query.priceMax;
        }
      }

      let search = Offer.find(filter);
      const limit = 2;
      if (req.query.sort) {
        if (req.query.sort === "price-desc") {
          search = search.sort({ product_price: "desc" });
        } else if (req.query.sort === "price-asc") {
          search = search.sort({ product_price: "asc" });
        }
      }
      if (req.query.page) {
        search = search
          .limit(limit)
          .skip((parseInt(req.query.page) - 1) * limit);
      } else {
        search = search.limit(limit);
      }
      search = await search;
      res.status(200).json(search);
    } else {
      const allOffers = await Offer.find();
      const totalOffers = allOffers.length;
      res.json({ "all Offers": allOffers, "total Offers": totalOffers });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Pour faire une recherche dans les annonces (bis)
router.get("/offersbis", isAuthenticated, async (req, res) => {
  try {
    let search = Offer;

    if (
      req.query.title ||
      req.query.priceMin ||
      req.query.priceMax ||
      req.query.sort ||
      req.query.page
    ) {
      if (!req.query.title && !req.query.priceMin && !req.query.priceMax) {
        search = search.find();
      }

      if (req.query.title) {
        const regexTitle = new RegExp(req.query.title, "i");
        search = search.find({ product_name: regexTitle });
      }

      if (req.query.priceMin) {
        search = search.find({
          product_price: { $gte: req.query.priceMin },
        });
      }

      if (req.query.priceMax) {
        search = search.find({
          product_price: { $lte: req.query.priceMax },
        });
      }

      if (req.query.sort) {
        if (req.query.sort === "price-desc") {
          search = search.sort({ product_price: "desc" });
        } else if (req.query.sort === "price-asc") {
          search = search.sort({ product_price: "asc" });
        }
      }

      if (req.query.page) {
        search = search.limit(3).skip((parseInt(req.query.page) - 1) * 3);
      } else {
        search = search.limit(3).skip(0);
      }

      search = await search;

      res.status(200).json(search);
    } else {
      const allOffers = await Offer.find();
      const totalOffers = allOffers.length;
      res
        .status(200)
        .json({ "all Offers": allOffers, "total Offers": totalOffers });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour récupérer les détails d'une annonce, en fonction de son id
router.get("/offer/:id", isAuthenticated, async (req, res) => {
  try {
    const searchById = await Offer.findById(req.params.id);
    res.status(200).json(searchById);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
