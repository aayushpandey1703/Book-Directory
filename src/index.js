const express=require('express')
require('./db/db')
const userRoute=require('./Routers/user')
const bookRoute=require('./Routers/book')
const hbs=require('hbs')
const path=require('path')
const bp=require('body-parser')
const sessions=require('express-session')
const { options } = require('./Routers/book')

const app=express()
app.use(express.json())
app.use(bp.urlencoded({ extended: false })); //bodyparser is must to get data in req.body

const publicPath=path.join(__dirname,'../public')
const viewsPath=path.join(__dirname,"../template/views")
const partialsPath=path.join(__dirname,"../template/partials")

app.set('view engine','hbs')
app.set('views',viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.static(publicPath))

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

hbs.registerHelper('slice',(time)=>{
    const timeArray=time.toString().split(" ")
    var sliceTime=timeArray[0]+","
    for(var i=1;i<4;i++)
        sliceTime=sliceTime+" "+timeArray[i]
    return sliceTime
})

hbs.registerHelper('length',(comments)=>{
    var len=comments.length
    return len
})

hbs.registerHelper('average',(arr)=>{
    if(arr.length==0)
        return 5
    var avg=0
    arr.forEach(element => {
        
        avg+=element.rate
    });
    avg=avg/arr.length
    console.log(avg)
    return avg
})

hbs.registerHelper('checkadmin',function(role,options){
    if(role=='admin')
        return options.fn(this)
    else    
        return options.inverse(this)
})

app.use(userRoute)
app.use(bookRoute)

app.listen(3000,()=>{
    console.log('server started')
})