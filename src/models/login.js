const mongoose=require('mongoose')
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        default:"Anonymous"
        },
    email:{
        type:String,
        unique:true,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        default:'user'
    },
    tokens:[
        {
            token:{
                type:String
            }
        }
    ]
},{timestamps:{createdAt:'created_at',updatedAt:'updated_at'}})

userSchema.virtual('bookAdded',{
    ref:'books',
    localField:'_id',
    foreignField:'uploadedBy'
})



userSchema.statics.findByEmailAndPassword=async (email,password)=>{
    const user=await users.findOne({email:email})
    if(user)
    {
        const check=await bcryptjs.compare(password,user.password)
        if(check)
            return user
        throw new Error('incorrect password')
    }
    throw new Error('No user exists')
}

userSchema.methods.getPublicData=async function(){
    var user=this.toObject()
    delete user.tokens
    delete user.password
    return user
}

userSchema.methods.generateToken=async function(){
    const userw=this
    const token=jwt.sign({_id:userw._id.toString()},'newtoken')
    userw.tokens=userw.tokens.concat({token:token})
    await userw.save()
    return token
}

userSchema.pre('save',async function(next){
    const user=this
    if(user.isModified('password'))
        user.password=await bcryptjs.hash(user.password,8)
    next()
})

const users=mongoose.model('users',userSchema)

module.exports=users