var express     = require("express"),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStatergy   = require("passport-local"),
    User        = require("./models/user");
    var passportLocalMongoose=require("passport-local-mongoose");
const { urlencoded } = require("body-parser");
var app=express();

const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        

// const url = "mongodb+srv://<wefive2>:<lodalussan>@cluster0.plske.mongodb.net/<Quora>?retryWrites=true&w=majority;

// const client = new MongoClient(url);

// async function run() {
//     try {
//         await client.connect();
//         console.log("Connected correctly to server");

//     } catch (err) {
//         console.log(err.stack);
//     }
//     finally {
//         await client.close();
//     }
// }

// run().catch(console.dir);

mongoose.connect("mongodb+srv://ashish:ohyeah@cluster0.plske.mongodb.net/Quora?retryWrites=true&w=majority",
{ useNewUrlParser: true, useCreateIndex:true}).then(()=>{
    console.log("DB Connected")
}).catch(err => {
    console.log(err);
})


app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({extended:true}));
    const port=8000;
    
    app.set("view engine", "ejs");
    // mongoose.connect("mongodb+srv://<wefive2>:<lodalussan>@cluster0.plske.mongodb.net/<Quora>?retryWrites=true&w=majority",{ useNewUrlParser: true } );

    // Modelss
    // Question Model
    QuestionSchema=new mongoose.Schema({
        question:String,

        answer: [
                // {
                //    type: mongoose.Schema.Types.ObjectId,
                //    ref: "Answer"
                // }    
                {
                    authoranswer:String,
                    answer:String
                }
             ],
        author: {
            id: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User"
            },
            username: String,
          
            
         }
    });

    // AnswerSchema=new mongoose.Schema({
    //     answer:String
    //     // author: {
    //     //     id: {
    //     //        type: mongoose.Schema.Types.ObjectId,
    //     //        ref: "User"
    //     //     },
    //     //     username: String,
            
    //     //  },
    //     //  image: String
    // });






   Question = mongoose.model("Question", QuestionSchema);


app.use(bodyParser.urlencoded({extended: true}));
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


     // Routes
    app.get("/",function(req,res){
        Question.find({}, function(err, question){
        if (err) {
            console.log(err);
        } else {
            //  console.log(req.user);
             res.render("home", {question:question}); //data + name passing in
        }   
    });
    });

    app.post("/",isloggedin,function(req,res){
        var author={id:req.user._id,
            username:req.user.username};
        var ques=req.body.ques;

        Question.create({question:ques,author:author},function(err,newques){
            if(err){
                console.log(err);
            }
            else{
    
Question.find({}, function(err, question){
        if (err) {
            console.log(err);
        } else {
             res.render("home", {question:question}); //data + name passing in
        }   
    });
            }
    })
        })

        app.get("/question/:id", function(req, res){
            //find the campground with the provided ID
            Question.findById(req.params.id, function (err,question) {
                if (err) {
                    console.log(err);
                
                } 
                else {
                    //render show template with that campground
                   res.render("showss", {question: question});
               }
            });
        });
        

        app.post("/:id/answer",isloggedin,function(req,res){

            // var ans=req.body.answer;
            //  Question.findById(req.params.id, function (err,question) {
            //         if (err) {
            //             console.log(err);
                    
            //         } 
            //         else {
            //             Answer.create({answer:ans},function(err,foundans){
            //             if(err){
            //                 console.log(err);
            //             }
            //             else{
            // console.log(foundans);
            //            question.answer.push(foundans._id);
            //             question.save();        
            //                     res.redirect("/question/" + question._id);
            //                 }
            //             });
            //         }
            //     });
            var author=req.user.username;
             var answer= req.body.answer;
            
          
            Question.findById(req.params.id, function (err,question){
                if(err){
                    console.log(err);
                }
                else{
                    var comments={authoranswer:author, answer: answer}
                    console.log(comments);
                    question.answer=question.answer.concat([comments]);
                    question.save(function(err,commentss)
                    {
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            res.redirect("/question/" + question._id);
                        }      
                
            })
        }
    })
})

            // Question.findById(req.params.id,function(err,question)
            // {
            //     var comments=req.body.comments
            //     question.answer.push(comments)
            //     question.save(function(err,commentss)
            //     {
            //         if(err)
            //         {
            //             console.log(err);
            //         }
            //         else
            //         {
            //             res.redirect("/question/" + question._id);
            //         }      
            //     });  
            //     });
            
            //        });


    // Authentication
    //================================================================

    app.get("/signup",function (req,res) {
        res.render("signup");
    });
    
    
    app.post("/signup",function (req,res) {
        
        User.register(new User({username:req.body.username}),req.body.password,function (err,user) {
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




    app.listen(process.env.PORT,process.env.IP,function(){
        console.log("Example app listening running")
    })