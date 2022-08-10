const users=require('../models/login')
const jwt=require('jsonwebtoken')

const auth=async (req,res,next)=>{
    try{
        var token=req.headers.cookie.split(';')[1]
        token=token.split('=')[1]
    const check=jwt.verify(token,'newtoken')
    const user=await users.findOne({_id:check._id,'tokens.token':token})
    if(!user)
        throw new Error()
    req.user=user
    req.token=token
    next()
    }
    catch(e)
    {
        res.redirect('/login')
    }

}



module.exports=auth