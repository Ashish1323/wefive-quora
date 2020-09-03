var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    userquestions:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question"
         },
    ],
    useranswers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Answer"
         },
    ],
    image:{ type: String, default: "default.jpg"},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false}
});



UserSchema.plugin(passportLocalMongoose); //adds the methods to our user

module.exports = mongoose.model("User", UserSchema);
