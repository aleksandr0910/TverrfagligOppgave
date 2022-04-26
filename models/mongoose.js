const mongoose = require('mongoose');


const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema ({
    
    email: String,
    password: String
  })
  
userSchema.plugin(passportLocalMongoose)

const user = mongoose.model('user', { name: String });
const person = new user({ name: 'Zildjian' });
person.save().then(() => console.log('hello'));