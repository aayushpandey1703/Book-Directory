const mongoose=require('mongoose')

const otpSchema=mongoose.Schema({
    _id:{
        type:mongoose.Schema.Types.ObjectId,
    },
    otp:{
        type:String
    }

})

const otpModel=new mongoose.model('otpModel',otpSchema)

module.exports=otpModel