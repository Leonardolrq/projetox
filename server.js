const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")

//const rotas
const admin = require("./routes/admin")
const usuario = require("./routes/usuario")

//models
require("./models/Postagem")
const Postagem = mongoose.model("postagens")

require("./models/Categoria")
const Categoria = mongoose.model("categorias")

//sessões
app.use(session({
    secret:"cursonode",
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

//Middleware
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error = req.flash("error_msg")    
    next()
})

//body-Parser
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())

//Handlebars
app.engine('handlebars',handlebars({default: 'main'}))
app.set('view engine','handlebars')

//Mongoose
mongoose.Promise = global.Promise; // adicional "evitar falhas"
mongoose.connect("mongodb://localhost/projetox").then(()=>{console.log('Conectado com banco')}).catch(error => handlerError(error));

//public 
app.use(express.static(path.join(__dirname,"public")))

//rotas
app.use('/admin' ,admin)
//rota principal
app.get("/" ,(req,res) => {
    Postagem.find().populate("categoria").lean().sort({data:"desc"}).then((postagens) => {
        res.render("index",{postagens:postagens})
    }).catch((err) =>{
        req.flash("error_msg", "houve um erro interno")
        res.redirect("/404")
    }) 
})
//postagem primcipal page
app.get("/postagem/:slug" , (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>{
        if(postagem){
            res.render("postagem/index" , {postagem: postagem})
        }else{
            req.flash("error_msg","Esta postagem não existe")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro interno")
        res.redirect("/")
    })
})
//listar categorias
app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) =>{
        res.render("categorias/index", {categorias : categorias})
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao listar categorias")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req,res)=>{
    Categoria.findOne({slug: req.params.slug}).then((categorias) =>{
        if(categorias){
            Postagem.find({categoria: categorias.id}).lean().then((postagens)=>{
                res.render("categorias/postagens", {postagens: postagens , categoria:categorias})
            }).catch((err)=>{
                req.flash("error_msg" , "Houve um erro interno ao listar posts!")
                res.redirect("/")
            })
        }else{
            req.flash("error_msg","Esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg" , "Houve um erro interno ao carregar página desta categoria")
        res.redirect("/")
    })
})


//rota 404
app.get("/404",(req,res)=>{
    res.send("Erro 404")
})

//registro de usuarios
app.use("/usuarios", usuarios)

//server port
const PORT = 2021
app.listen(PORT,()=>{
    console.log("Servidor rodando na porta :"+PORT)
})