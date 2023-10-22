// is the environment variable, NODE_ENV, set to PRODUCTION? 
import fs from 'fs';
import path from 'path';
import url from 'url';

// 1ST DRAFT DATA MODEL
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://127.0.0.1:27017/hw05';
}

//setup connection

const mongooseOpts = ({
    useNewUrlParser: true,  
    useUnifiedTopology: true
  });
  
mongoose.connect(dbconf, mongooseOpts).then(console.log('connected to database')).catch(err=>console.log(err));


const Project=new mongoose.Schema({
    projectTitle: {type: String, required:true},
    projectDescription:{type: String, required: true},
    //skills: [{type: mongoose.Schema.Types.ObjectId, ref:'Skill'}],
    //images: [{type: String, url: String, required: false}],
    projectDemoURL: {type:String, required: false},
    createdDate:{type: String, required: false}  
})



//create user schema for user authentication
const User=new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const Feedback=new mongoose.Schema({
  reviewerName:{
    type:String,
    required:true
  },
  reviewerFeedback:{
    type:String,
    required:true
  }
})

User.pre('save', function(next) {
    const user = this;
    if (!user.isModified('password')) { return next(); }
    bcrypt.genSalt(10, function(err, salt) {
      if (err) { return next(err); }
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) { return next(err); }
        user.password = hash;
        next();
      });
    });
  });
  
  // Check if the given password matches the user's password
  User.methods.checkPassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) { return callback(err); }
      callback(null, isMatch);
    });
  };

  

//registering models
mongoose.model('Project',Project);
mongoose.model('User',User);
mongoose.model('Feedback',Feedback);

// mongoose.model('Skill',Skill);
