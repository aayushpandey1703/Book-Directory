const mongoose=require('mongoose')

const bookSchema=new mongoose.Schema({
    image:{
        type:Buffer,
    },
    title:{
        type:String,
        required:[true,'title required'],
        trim:true
    },
    author:{
        type:String,
        required:[true,'author name required'],
        trim:true
    },
    description:{
        type:String,
        required:[true,'description required']
    },
    rating:[
        {
        rate:{
        type:Number,
        },
        name:String,
        _id:mongoose.Schema.Types.ObjectId
    }],
    comments:[
        {
            comment:
            {
                type:String,
            },
            name:String,
            posted:{
                type:Date,
                default:Date.now()
            },
            _id:mongoose.Schema.Types.ObjectId
        }
    ],
    uploadedBy:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'login'
    }
    
},{timestamps:{createdAt:'created_at',updatedAt:'updated_at'}})

bookSchema.methods.addRating=async function(req){
    const book=this
    book.rating=book.rating.concat({rate:req.body.rate,name:req.user.name,_id:req.user._id})
    book.comments=book.comments.concat({comment:req.body.comment,name:req.user.name,_id:req.user._id})
    await book.save({timestamps:{updated_at:false}})

}

bookSchema.methods.getPublicData=async function(){
    var book=this.toObject()
    delete book.image
    var sum=0
    br=book.rating
   br.forEach(element => {
        sum=sum+element.rate
    })
    book.avgRating=sum/book.rating.length
    delete book.rating
    return book
    
}

const books=mongoose.model('books',bookSchema)

module.exports=books