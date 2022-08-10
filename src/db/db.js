const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/book',{useNewUrlParser:true}).then((result)=>{
    console.log("Connected to Database")
}).catch((error)=>{
    console.log(error)
})