const express = require ("express")
//import express routes
const router = express.Router()
//import mongoose
const mongoose = require ("mongoose")

//*Usuarios
require ("../models/Usuarios")
const Usuario = mongoose.model("usuarios")

router.get("/registro", (req,res) =>{
    res.render("usuarios/registro")
})

module.exports = router