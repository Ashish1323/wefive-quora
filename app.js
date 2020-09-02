var express     = require("express"),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStatergy   = require("passport-local"),
    User        = require("./models/user");
    Answer= require("./models/answer");
    Question = require("./models/question");
    var flash = require('connect-flash');
    var nodemailer = require("nodemailer");
var crypto = require("crypto");
cookieParser = require("cookie-parser")
var async = require('async');

var app=express();

    var passportLocalMongoose=require("passport-local-mongoose");
const { urlencoded } = require("body-parser");
const question = require("./models/question");
// configure dotenv
require('dotenv').config();
app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');
const Upload = require('express-fileupload');
 var multer  = require('multer');
const path = require('path');
const { findByIdAndUpdate } = require("./models/question");
// var upload = multer({ dest: 'uploads/' })
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});




const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('myImage');
  
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init Upload






mongoose.connect("mongodb://localhost:27017/Quora",{ useNewUrlParser: true } );


app.use(express.static(__dirname + "/public"));
app.use(flash());


app.use(bodyParser.urlencoded({extended:true}));
    const port=8000;

    
    app.use(require("express-session")({
        secret:"oh yeah",
        resave:false,
        saveUninitialized:false
    }));

    // Passport Setup

app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

passport.use(new LocalStatergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



    
    app.set("view engine", "ejs");
    //ROUTES 

    // HOME ROUTE
    app.get("/",function(req,res){
        var noMatch = null;
        if(req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            // Get all campgrounds from DB
            
                Question.find({question: regex}, function(err, allCampgrounds){
                    if(err){
                        console.log(err);
                    } else {
                        console.log(regex,allCampgrounds)
                       if(allCampgrounds.length < 1) {
                         noMatch = "No Questions match that query, please try again.";
                         req.flash("error", "Campground no found");
                         User.find({username:regex},function(err,founduser){
                            if(err){
                                console.log(err);
                            }
                            else{
                                console.log(founduser)
                                res.render("search",{user:founduser});
                            }
                        })
                         // return res.redirect("back");
                       }
                       else{
                        res.render("home",{question:allCampgrounds, noMatch: noMatch});
                       }
                   
                    }
                 });
            
    
         
        }
        else{
        Question.find({}, function(err, question){
        if (err) {
            console.log(err);
        } else {
            //  console.log(req.user);
             res.render("home", {question:question,noMatch: noMatch}); //data + name passing in
        }   
    });
}
    });
    // Question Post
    app.post("/",isloggedin,function(req,res){
        var author={id:req.user._id,
            username:req.user.username};
            var ques=req.body.ques;
            var category= req.body.A;

        Question.create({question:ques,author:author, category:category},function(err,newques){
            if(err){
                console.log(err);
            }
            else{
    
                User.findById(req.user._id,function(err,user){
                    if(err){
                        console.log(err);
                    }
                    else{
                        user.userquestions=user.userquestions.concat(newques);
                        user.save();
                    }
                })
        Question.find({}, function(err, question){
        if (err) {
            console.log(err);
        } else {
            var noMatch;
             res.render("home", {question:question,noMatch: noMatch}); //data + name passing in
        }   
    });
            }
    })
        })

        // Questions Route GET
        app.get("/question/:id", function(req, res){
            //find the campground with the provided ID
            Question.findById(req.params.id).populate("answers").exec(function(err,question){
                if (err) {
                    console.log(err);
                
                } 
                else {
                    //render show template with that campground
                   res.render("showss", {question: question});
               }
            });
        });

        app.get("/category/:category", function(req,res){
            Question.find({"category":req.params.category},function (err,fuckyeah) {
                if(err){
                    console.log(err);
                }
                else{
                    console.log(fuckyeah);
                    var noMatch;
                    res.render("Category", {question:fuckyeah,noMatch: noMatch});
                }
                
            })
          
            
        })

        app.post("/:id/answer",isloggedin,function(req,res){
            var ans=req.body.answer;
            var author={id:req.user._id,
                username:req.user.username};
var answer={answer:ans,author:author};
   Question.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            Answer.create(answer, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    

                    User.findById(req.user._id,function(err,user){
                        if(err){
                            console.log(err);
                        }

                        else{
                            user.useranswers=user.useranswers.concat(comment);
                            comment.question.push(campground);
                            comment.save();
                            user.save();
                        }
                    })
                    //  campground.answers=campground.answers.concat([comment]);
                    campground.answers.push(comment);

                    campground.save();
                    res.redirect("/question/" + campground._id);
                }
            });
        }
    });
})


app.get("/:id/profile",function(req,res){

        
    
            User.findById(req.params.id).populate("userquestions").exec(function(err,question){
        if (err) {
            console.log(err);
        
        
        } 
    
        else {
        
            Answer.aggregate([

                {$unwind : "$author" },
                    {$match: {'author.id': {$in:[mongoose.Types.ObjectId(req.params.id)]}} },
        
                // { "$group": {
                //     "_id": "$_id",
                //     "annswer": { "$push": "$answer" }
          
                // }},
        
                {$lookup:{ from: "questions", localField:"question", 
                  foreignField:"_id",as:"myCustomResult"}},
        
                  {
                    $unwind: "$myCustomResult"
                  }
          ]).exec((err, result)=>{
                if (err) {
                    console.log("error" ,err)
                }
                if (result) {
                    console.log(result);
                    console.log(question)
                    res.render("profile",{results:result,question:question});
                }
          });
           

        
        }

    })

         
         

    

    
})

// app.post('/:id/upload', (req, res) => {
//   upload(req, res, (err) => {
//     if(err){
//       console.log(err)
//       }
//      else {
      
       
//  User.findById(req.params.id).populate("userquestions").exec(function(err,question){
//         if (err) {
//             console.log(err);
//     } 
    
//         else {
//             User.findById(req.params.id).populate("useranswers").exec(function(err,answer){
//                 if (err) {
//                     console.log(err);
//                 } 
//           else {
           
//                 if(answer.useranswers.length){
//             Question.findById(answer.useranswers[0].question.toString(),function(err,foundques){
//                     if(err){
//                                 console.log(err);
//                             }
//                              else{
//                                  console.log(req.file.filename)
//                                  Answer.aggregate([

//                                     {$unwind : "$author" },
//                                         {$match: {'author.id': {$in:[mongoose.Types.ObjectId(req.params.id)]}} },
                            
//                                     // { "$group": {
//                                     //     "_id": "$_id",
//                                     //     "annswer": { "$push": "$answer" }
                              
//                                     // }},
                            
//                                     {$lookup:{ from: "questions", localField:"question", 
//                                       foreignField:"_id",as:"myCustomResult"}},
                            
//                                       {
//                                         $unwind: "$myCustomResult"
//                                       }
//                               ]).exec((err, result)=>{
//                                     if (err) {
//                                         console.log("error" ,err)
//                                     }
//                                     if (result) {
//                                         console.log(result);
//                                         // res.render("profile",{results:result,question:question});
//                                         res.render("profile",{answer:answer,question:question,ques:foundques,file:`uploads/${req.file.filename}`,results:result});
//                                     }
//                               });
               
//                         }
//                         })
// }
//                     else{
//                         Answer.aggregate([

//                             {$unwind : "$author" },
//                                 {$match: {'author.id': {$in:[mongoose.Types.ObjectId(req.params.id)]}} },
                    
//                             // { "$group": {
//                             //     "_id": "$_id",
//                             //     "annswer": { "$push": "$answer" }
                      
//                             // }},
                    
//                             {$lookup:{ from: "questions", localField:"question", 
//                               foreignField:"_id",as:"myCustomResult"}},
                    
//                               {
//                                 $unwind: "$myCustomResult"
//                               }
//                       ]).exec((err, result)=>{
//                             if (err) {
//                                 console.log("error" ,err)
//                             }
//                             if (result) {
//                                 console.log(result);
//                                 // res.render("profile",{results:result,question:question});
//                                 res.render("profile",{answer:answer,question:question,ques:foundques,file:`uploads/${req.file.filename}`,results:result});
//                             }
//                       });
//                     }
//                     }    
//             });
            
//     }  
//     });
    
       	
//       }
    
// })
// })
app.post('/:id/upload', (req, res) => {
    upload(req, res, (err) => {
      if(err){
        console.log(err)
        }
       else {
        
         
   User.findById(req.params.id).populate("userquestions").exec(function(err,question){
          if (err) {
              console.log(err);
      } 
      
          else {
              User.findById(req.params.id).populate("useranswers").exec(function(err,answer){
                  if (err) {
                      console.log(err);
                  } 
            else {
  User.findByIdAndUpdate(req.params.id,{image:req.file.filename},function(err,randi){
  if(err){
  console.log(err);
  }
  else
  {
  
  
  
                  if(answer.useranswers.length){
              Question.findById(answer.useranswers[0].question.toString(),function(err,foundques){
                      if(err){
                                  console.log(err);
                              }
                               else{
                                   console.log(randi)
                  res.redirect("/"+randi._id+"/profile");
                          }
                          })
  }
                      else{
                          console.log(randi)
                       res.redirect("/"+randi._id+"/profile");
                      }
                      }
  
              });
              
      }
      })  
      
      
             
        }
      
  })
  }
  })
  })
app.get("/signup",function (req,res) {
    res.render("signup",{errors:"" ,password:""});
});

app.post("/signup",function (req,res) {
    var name = req.body.username;
    var email = req.body.Email;
    var password = req.body.password;
    User.register(new User({username:req.body.username,email:req.body.Email}),req.body.password, function (err,user) {
        if(err){
            console.log(err);
            return res.render("signup");
        }
            passport.authenticate("local")(req,res,function (){
                res.redirect("/");
            })
        
    })
})

app.get("/signin",function (req,res) {
    res.render("signin");
});
app.get("/about", function (req,res) {
    var noMatch
    res.render("About",{
        noMatch:noMatch
    });
});
app.get("/front", function (req,res) {
    var noMatch
    res.render("front",{
        noMatch:noMatch
    });
});
 app.get("/category",function(req,res){
        var noMatch = null;
        if(req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            // Get all campgrounds from DB
            Question.find({question: regex}, function(err, allCampgrounds){
               if(err){
                   console.log(err);
               } else {
                   console.log(regex,allCampgrounds)
                  if(allCampgrounds.length < 1) {
                    noMatch = "No Questions match that query, please try again.";
                    req.flash("error", "Campground no found");
                    // return res.redirect("back");
                  }
                  res.render("category",{question:allCampgrounds, noMatch: noMatch});
               }
            });
        }
        else{
        Question.find({}, function(err, question){
        if (err) {
            console.log(err);
        } else {
            //  console.log(req.user);
             res.render("Category", {question:question,noMatch: noMatch}); //data + name passing in
        }   
    });
}
    });
    // Question Post
    app.post("/category",isloggedin,function(req,res){
        var author={id:req.user._id,
            username:req.user.username};
            var ques=req.body.ques;
            var category= req.body.A;

        Question.create({question:ques,author:author, category:category},function(err,newques){
            if(err){
                console.log(err);
            }
            else{
    
                User.findById(req.user._id,function(err,user){
                    if(err){
                        console.log(err);
                    }
                    else{
                        user.userquestions=user.userquestions.concat(newques);
                        user.save();
                    }
                })
        Question.find({}, function(err, question){
        if (err) {
            console.log(err);
        } else {
            var noMatch;
             res.render("Category", {question:question,noMatch: noMatch}); //data + name passing in
        }   
    });
            }
    })
        })
app.post("/signin",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/signin"
}),
 function (req,res){
    console.log("login successful");
 })
app.get("/logout",function (req,res) {
    req.logout();
    res.redirect("/");
});


function isloggedin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/signup");
}


// RESTFul API....................
// Delete Question User
    app.post("/question/:id",function(req,res){
        Question.findByIdAndRemove(req.params.id, function(err){
            if (err) {
                res.redirect("/");
            } else {
                res.redirect("/");
            }
        });
    })

    app.post("/answer/:id",function(req,res){
        Answer.findByIdAndRemove(req.params.id, function(err){
            if (err) {
                res.redirect("/");
            } else {
                res.redirect("/");
            }
        });
    })

    // app.get("/edit/answer/:id",function(req,res){
        
         
    //             User.findById(req.params.id).populate("useranswers").exec(function(err,answer){
    //                 res.render("editanswer",{answer:answer});
    //                 console.log(answer.useranswers[0].answer);
  
    //             })        
        
    // })

    //edit
    app.get("/edit/answer/:id",function(req,res){
        
         
        Answer.findById(req.params.id,(function(err,answer){
            
           if(err){
               console.log(err);
           }
           else{
            res.render("editanswer",{ answer:answer, id:req.params.id  });

           
            console.log(req.params.id);
            console.log(answer._id.toString());

    

           }
        })
                  
        )
})

app.post("/edit/answer/:id",function(req,res){
var ans= req.body.answer;
Answer.findByIdAndUpdate(req.params.id,{answer:ans},function(err,answer){
if(err){
    console.log(err);
}
else{
    res.redirect("/");
}

})
})




      // likes and dislikes

      app.post("/do-like",function(req,result){
        console.log(req.body.answerId);
        if(req.user._id){
            Answer.findOne({
                "_id": req.body.answerId,
                "likes._id": req.user._id
            },function(error,answer){
                if(answer== null){
                    Answer.updateOne({
                        "_id":req.body.answerId
                    },{
                            $push:{
                                "likes":{
                                    "_id": req.user._id
                                }
                            }
                        },function(error,data){
                            result.json({
                                "status": "success",
                                "message": "Answer has been liked"
                            });
                        })
                    }else{
                        result.json({
                            "status": "error",
                            "message": "Already liked this answer"
                        });
                    }
            });

        }else{
            result.json({
                "status": "error",
                "message": "Please login"
            });
        }
    })


    app.post("/do-Dislike",function(req,result){
        console.log(req.body.answerId);
        if(req.user._id){
            Answer.findOne({
                "_id": req.body.answerId,
                "dislikes._id": req.user._id
            },function(error,answer){
                if(answer== null){
                    Answer.updateOne({
                        "_id":req.body.answerId
                    },{
                            $push:{
                                "dislikes":{
                                    "_id": req.user._id
                                }
                            }
                        },function(error,data){
                            result.json({
                                "status": "success",
                                "message": "answer has been disliked"
                            });
                        })
                    }else{
                        result.json({
                            "status": "error",
                            "message": "Already disliked this answer"
                        });
                    }
            });

        }
        else{
            result.json({
                "status": "error",
                "message": "Please login"
            });
        }
    })
    app.get('/forgot', function(req, res) {
        res.render('forgot');
      });
      
      app.post('/forgot', function(req, res, next) {
        async.waterfall([
          function(done) {
            crypto.randomBytes(20, function(err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
          },
          function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
              if (!user) {
                req.flash('error', 'No account with that email address exists.');
                return res.redirect('/forgot');
              }
      
              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      
              user.save(function(err) {
                done(err, token, user);
              });
            });
          },
          function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
              service: 'Gmail', 
              auth: {
                user: 'ashishagnihotri2k@gmail.com',
                pass: 'Mom.2300'
              }
            });
            var mailOptions = {
              to: user.email,
              from: 'ashishagnihotri2k@gmail.com',
              subject: 'Node.js Password Reset',
              text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              console.log('mail sent');
              req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
              done(err, 'done');
            });
          }
        ], function(err) {
          if (err) return next(err);
          res.redirect('/forgot');
        });
      });
      
      app.get('/reset/:token', function(req, res) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        //   if (!user) {
        //     req.flash('error', 'Password reset token is invalid or has expired.');
        //     return res.redirect('/forgot');
        //   }
          res.render('reset', {token: req.params.token});
        });
      });
      
      app.post('/reset/:token', function(req, res) {
        async.waterfall([
          function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
              if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('back');
              }
              if(req.body.password === req.body.confirm) {
                user.setPassword(req.body.password, function(err) {
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;
      
                  user.save(function(err) {
                    req.logIn(user, function(err) {
                      done(err, user);
                    });
                  });
                })
              } else {
                  req.flash("error", "Passwords do not match.");
                  return res.redirect('back');
              }
            });
          },
          function(user, done) {
            var smtpTransport = nodemailer.createTransport({
              service: 'Gmail', 
              auth: {
                user: 'ashishagnihtori2k@gmail.com',
                pass: 'Mom.2300'
              }
            });
            var mailOptions = {
              to: user.email,
              from: 'learntocodeinfo@mail.com',
              subject: 'Your password has been changed',
              text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              req.flash('success', 'Success! Your password has been changed.');
              done(err);
            });
          }
        ], function(err) {
          res.redirect('/');
        });
      });


    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };






        app.listen(port,function(){
            console.log(`Example app listening at http://localhost:${port}`)
        }); 

        