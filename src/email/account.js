const mailjet = require('node-mailjet').connect('707fdd3a46bbfe99c421a7d2703dc1fc','ff0414bff24db2a7145d4e08f7668dcc')  

const sendWelcomeEmail = (email,name,otp)=>{
    const request = mailjet
    .post("send", {'version': 'v3.1'})
    .request({
      "Messages":[
        {
          "From": {
            "Email": "aleronpeterson@gmail.com",
            "Name": "Aleron Peterson"
          },
          "To": [
            {
              "Email": email,
              "Name": name
            }
          ],
          "Subject": "Greetings from Book-Directory.",
          "HTMLPart": "<h2>Dear "+name+"</h2><br> Your OTP is: <br> <b>"+otp,
        }
      ]
    })
    request
      .then((result) => {
        console.log('done')
      })
      .catch((err) => {
        console.log(err.statusCode)
      })
  }
 
module.exports=sendWelcomeEmail