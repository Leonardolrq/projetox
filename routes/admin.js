const express = require ("express")
//import express routes
const router = express.Router()
//import mongoose
const mongoose = require ("mongoose")
//import models
//*Categoria
require ("../models/Categoria")
const Categoria = mongoose.model("categorias")
//*Postagem
require ("../models/Postagem")
const Postagem = mongoose.model("postagens")


router.get('/',(req,res)=>{
    res.render("admin/index")
})

router.get("/post", (req,res)=>{
    req.send("Página de posts")
})

router.get("/categorias",(req, res)=>{
    Categoria.find().lean().sort({data:'desc'}).then((categorias)=>{
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
    
})

router.get("/categorias/add", (req,res)=>{
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", (req,res)=>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug invalido"})
    }
    if(req.body.nome.length <2){
        erros.push({texto: "Nome da categoria é muito pequeno"})
    }
    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome:req.body.nome,
            slug:req.body.slug
        }
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg","Categoria criada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
        })
    } 
})

//rota editar categoria com dados atualziados
router.get("/categorias/edit/:id",(req,res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias",{categoria: categoria})
    }).catch((err)=>{
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})

//rota de aplicar edição de categoria
router.post("/categorias/edit",(req,res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria) =>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao salvar categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err)=>{
        req.flash("error_msg","Houve um errro ao editar categorias")
        res.redirect("/admin/categorias")
    })
})
//deletar post
router.post("/categorias/deletar",(req,res) => {
    Categoria.remove({_id:req.body.id}).then(() => {
        req.flash("sucess_msg","Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg","Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})
// teste de pagina de teste 
router.get("/teste", (req,res)=>{
    req.send("Página de teste")
})

//rotas de postagens
//router.get("/postagens", (req,res)=>{

//    Postagem.find().lean().populate("categorias").sort({data:"desc"}).then((postagens)=>{
//        res.render("admin/postagens" , {postagens : postagens})
//    }).catch((err) => {
//        req.flash("error_msg","Houve um erro ao listar as postagens")
//        res.redirect("/admin")
//        console.log("Erro ao rota de postagens")
//    })
//})
router.get("/postagens",(req, res)=>{
    Postagem.find().lean().populate( "categoria").sort({data:'desc'}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
        console.log("Erro ao rota de postagens")
    })
    
})

//Formulario de cadastro de postagens
router.get("/postagens/add",(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem",{categorias:categorias})
    }).catch((err) => {
        req.flash("error_msg","Houve um erro ao salvar o formulario")
        res.redirect("/admin")
    })
})
//salvar post
router.post("/postagens/nova",(req,res)=>{
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida , registre uma categoria"})
    }
    if(erros.length > "0"){
        res.render("admin/addpostagem", {erros:erros})
    }
    else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg","Postagem criada com suceesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg","Houve um erro ao criar postagem")
            res.redirect("/admin/postagens")
        })
    }
})

//editar postagem
router.get("/postagens/edit/:id" , (req,res)=>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{

        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens",{categorias: categorias , postagem: postagem})
        }).catch((err)=>{
            req.flash("error_msg","houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao carregar formulario de edição")
        res.redirect("/admin/postagens")
    })

    
})

//Aplicar alterações da postagem
router.post("/postagem/edit" , (req,res)=>{
    Postagem.findOne({_id: req.body.id}).lean().then((postagem) =>{

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg" , "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })

    }).catch((err) =>{
        req.flash("error_msg", "houve um erro ao salvar edição")
        res.redirect("/admin/postagens")
    })
})

//deletar post
router.get("/postagens/deletar/:id", (req,res) =>{
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) =>{
        req.flash("error_msg", "houve um erro interno")
        res.redirect("/admin/postagens")
    })
})

module.exports = router