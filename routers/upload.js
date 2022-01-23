const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../Models/User");
const Offer = require("../Models/Offer");

router.post("/upload", async (req, res) => {});
