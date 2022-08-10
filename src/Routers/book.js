const express=require('express')
const books=require('../models/books')
const login=require('../models/login')
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp=require('sharp')
const { Router } = require('express')
const upload=multer(
    {
        limits:{
            fileSize:3000000
        }
    }
)
const route=express.Router()

route.get('/',async (req,res)=>{
    try{
        var book=await books.find()
        const user=await login.findById(req.session.userid)
        var length=0
        for(var i=0;i<book.length;i++)
        {
            book[i]=await book[i].getPublicData()
        }       
         res.render("index",{data:book,user:user})
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
    
})

route.get('/book/:id',async (req,res)=>{                    
    try{    
        var book=await books.findById(req.params.id)
        book=await book.getPublicData()
        var similar=await books.find({author:book.author})
        similar=similar.filter((data)=>{
            return data._id!=req.params.id
        })

        res.render("book",{data:book,similar:similar})
    
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }

})

//admin

route.get('/admin',auth,async (req,res)=>{
    res.render('add_book')
})

route.post('/book',auth,async (req,res)=>{
    try{
        req.body.uploadedBy=req.user._id
        const book=new books(req.body)
        await book.save()
        console.log(book)
        res.send(book)
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
})



route.get('/mybook',auth,async (req,res)=>{
    try{  
        const user=await login.findById(req.user._id)
        await user.populate({
            path:'bookAdded'
        })
        res.send(user.bookAdded)

    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
})

route.delete('/book/:id',auth,async (req,res)=>{
    try{
        await books.findByIdAndDelete(req.params.id)
        res.send("deleted")
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
})



route.get('/allbook',async (req,res)=>{
    try{
        var book=await books.find()
        var length=0
        for(var i=0;i<book.length;i++)
        {
            book[i]=await book[i].getPublicData()
        }
        res.send(book)
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
    
})





// image

route.post('/upload/:id',auth,upload.single('cover'),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).jpeg().resize({width:250,height:250}).toBuffer()
    const book=await books.findById(req.params.id)
    book.image=buffer
    await book.save()
    res.send('image uploaded')
    
},(err,req,res,next)=>{
    res.status(500).send({error:err.message})
})

route.get('/upload/:id',async (req,res)=>{
    try{
        const book=await books.findById(req.params.id)
        if(!book)
            throw new Error('no book found') 
        res.set("Content-Type","image/jpeg")       
        res.send(book.image)
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
})

// rating 


route.post('/rating/:id',auth,async (req,res)=>{
    try{
        const book=await books.findById(req.params.id)
        await book.addRating(req)
        res.send(book)
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
})



module.exports=route