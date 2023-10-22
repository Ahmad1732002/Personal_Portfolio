import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import './db.mjs';
import mongoose from 'mongoose';
import passport from 'passport';
import passport_local from 'passport-local';
import session from 'express-session';

//At first I imported unsplashJs library but faced an issue with using fetch in server side so I had to
//move it to client side and it took me so much time to figure out the error and how to resolve it
import * as unsplashJs from 'unsplash-js';

//I had issues with installing sass-middleware library using npm install on windows
//so I had to copy the module from github to node module manually and refer to it like this
//import sassMiddleware from 'node-sass-middleware/node-sass-middleware-master/middleware.js';
//by using npm install sass-middleware the line below would be sufficient
import sassMiddleware from 'sass-middleware';
import fs from 'fs';
const app = express();



const Project=mongoose.model('Project');
// const Skill=mongoose.model('Skill');
const User=mongoose.model('User');
const Feedback=mongoose.model('Feedback');



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



passport.use(new passport_local.Strategy({
   usernameField: 'username', // change to username
   passwordField: 'password'
 }, function (username, password, done) {
   //Find the user with the given username
   User.findOne({username:username}).then(user=>{
      if(!user){
         return done(null, false, { message: 'Incorrect username.' });
      }
         console.log('user is correct')
         user.checkPassword(password, function (err, isMatch) {
            if (err) { return done(err); }
            if (!isMatch) { return done(null, false, { message: 'Incorrect password.' }); }
            return done(null, user);
          });
      }).catch(err=>{
         return done(err);
      })}));
   
 app.use(session({
   secret: 'keyboard cat',
   resave: false,
   saveUninitialized: false
 }));
 
 app.use(passport.initialize());
 app.use(passport.session());
 
 // Serialize and deserialize user
 passport.serializeUser(function (user, done) {
   done(null, user.id);
 });
 
 passport.deserializeUser(function (id, done) {
   User.findById(id).then(user => done(null, user))
  .catch(err => done(err, null));
 });

app.use(express.static(path.join(__dirname, 'public')));

// configure templating to hbs
app.set('view engine', 'hbs');

// body parser (req.body)
app.use(express.urlencoded({ extended: false }));
//use middleware for sass

 
//using sassMiddleware to compile automatically the content in the sass file style.scss in  /public/stylesheets/sass
//to the css file in /public/stylesheets/css
 app.use(
   sassMiddleware({
     src: __dirname + '/public/stylesheets/sass', // Sass source directory
     dest: __dirname + '/public/stylesheets/css', // CSS destination directory
     debug: true, // Output compiled CSS to console
     prefix: '/stylesheets/css', // Set the path to the CSS file in the HTML
     
   })
 );

 app.use(express.json());

 //pass the isauthenticated variable to everytime i render the page with the help of layout.hbs
 app.use((req, res, next) => {
   res.locals.isAuthenticated = req.isAuthenticated();
   if(req.user){
   res.locals.username=req.user.username
   }
   next();
 });


app.get('/',(req,res)=>{
   res.render('home');
})


app.get('/login',(req,res)=>{
   
   
   res.render('login');
})

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);


app.get('/projects', async (req,res)=>{
   
   try{
      let foundProjects=  await Project.find({})
      if(!req.query.keyword){
         res.render('projects',{projects:foundProjects})
      }
      else{

         let filteredProjects=foundProjects.filter(proj=>{
            //make it case sensitive
            if(proj.projectTitle.toLowerCase().includes(req.query.keyword.toLowerCase())){
               return proj;
            }
         })
         res.render('projects',{projects:filteredProjects});
      }
      
   }
   catch(err){
      throw err;
   }
 
   // Project.find({}).then(foundProject=>{
   //    res.render('projects',{projects:foundProject})
   // }).catch(err=>res.status(500).send('server error'))
});





//only allow admin to access addProject route
app.get('/addProjects', (req, res, next) => {
   if (req.isAuthenticated() && req.user.username === 'admin') {
     return next();
   }
   //res.render('unauthorized')
   res.status(401).send('<h1>Unauthorized access, need to be registered as admin to access this page<h1>')
 }, (req, res) => {
   res.render('addProjects')
   // Render the /addProjects view here
 });

 app.get('/logout', (req, res) => {
   req.logout((err) => {
      if (err) {
        console.error(err);
        return res.redirect('/error');
      }
      res.redirect('/');
    });
 });

 app.get('/register',(req,res)=>{
   res.render('register');
 })

 app.post('/register',async (req,res)=>{
   

   const existingUser= await User.findOne({username:req.body.username});
   if(existingUser){
      const existingErrorMsg='User already exists'
      res.render('register',{Error:existingErrorMsg});
   }
   else{

   const newUser=new User({
      username:req.body.username,
      password:req.body.password
   })
   const savedUser= await newUser.save()
   res.redirect('/login');
   }

   
 })

app.post('/addProjects',(req,res)=>{
   const newProject=new Project({
      projectTitle: req.body.projectTitle,
      projectDescription: req.body.projectDescription,
      projectDemoURL:req.body.projectDemoURL,
      createdDate:req.body.createdDate
   })

   newProject.save().then(proj=>{
      res.redirect('/projects');
   }).catch(err=>res.status(500).send('server error'));
})

app.get('/feedback', async(req,res)=>{
   const foundFeedbacks=await Feedback.find();
   console.log(foundFeedbacks)
   res.render('feedback',{reviews:foundFeedbacks});


})

app.post('/feedback',async(req,res)=>{
   const newFeedback=new Feedback({
      reviewerName:req.body.reviewerName,
      reviewerFeedback:req.body.reviewerFeedback
   });
   console.log(req.body.reviewerName)
   try{
      await newFeedback.save();
      console.log('new feedback saved');
      res.send({newFeedback, error: null});
      }
   catch(err){
      throw err;
   }
})



app.listen(process.env.PORT ?? 3000);
