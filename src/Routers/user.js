const express=require('express')
const auth=require('../middleware/auth')
const users=require('../models/login')
const otpModel=require('../models/otp')
const otpmail=require('../email/account')
const cookie=require('cookie-parser')

const route=express.Router()

route.get('/allusers',async (req,res)=>{
    try{
        const user=await users.find()
        res.send(user)
    }
    catch(e){
        res.status(500).send({error:e})
    }
    
})

route.post('/register',async (req,res)=>{
    try{
        const user=new users(req.body)
        await user.save()
        const token=await user.generateToken()
        res.send({user:user,token:token})
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
})

route.get('/login',(req,res)=>{
    res.render('login')
})

route.post('/login',async (req,res)=>{
    try{
        const user=await users.findByEmailAndPassword(req.body.email,req.body.password)
        const randNumber=Math.floor((Math.random()*900000)+800000)
        const check=await otpModel.findById(user._id)
        if(check==undefined)
        {
            const otp=new otpModel({
                _id:user._id,
                otp:randNumber
            })
            await otp.save()
        }   
        else{
            check.otp=randNumber
            await check.save()
        }
        otpmail(user.email,user.name,randNumber)
        req.session.userid=user._id
        res.send({user:user})
    }
    catch(e)
    {
        res.send({error:e.message})
    }
})

route.get('/verify',async (req,res)=>{
    try{
        if(req.session.userid==undefined)
            throw new Error('no access')
        const user=await users.findById(req.session.userid)
        res.render('verify',{user:user})
    }
    catch(e)
    {
        res.redirect('/')
    }
})

route.post('/otp',async (req,res)=>{
    try{
        const otp=req.body.otp
        const user=await users.findById(req.session.userid)
        const getOtp=await otpModel.findById(req.session.userid)

        if(otp!=getOtp.otp)
            return res.send({error:"OTP mismatched"})
        const token=await user.generateToken()

        res.cookie("access_token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV='production'
        }).send({user:user,token:token})

    }
    catch(e)
    {
        res.send({error:e.message})
    }
})

route.patch('/otp',async (req,res)=>{
 try{
    const randNumber=Math.floor((Math.random()*900000)+800000)
    const getOtp=await otpModel.findByIdAndUpdate(req.session.userid,{otp:randNumber})
    const user=await users.findById(req.session.userid)
    otpmail(user.email,user.name,randNumber)
    res.send({user:user})
 }
 catch(e)
 {
    res.send({error:e.message})
 }
})

route.get('/user',auth,async (req,res)=>{
    try{
        var user=req.user
        user=await user.getPublicData()
        res.send(user)
    }
    catch(e){
        res.status(500).send({error:e})
    }
})

route.patch('/user',auth,async (req,res)=>{
    try{
        const updates=Object.keys(req.body)
        const user=req.user
        updates.forEach((ele)=>{
            user[ele]=req.body[ele]
        })
        await user.save()
        res.send(user)
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
})

route.get('/logout',auth,async (req,res)=>{
    try{
        const user=req.user
        user.tokens=user.tokens.filter((token)=>{
            return token.token!=req.token
        })
        await user.save()
        req.session.destroy()
        res.redirect('/')
    }
    catch(e)
    {
        res.status(500).send({error:e})
    }
}) 

module.exports=route