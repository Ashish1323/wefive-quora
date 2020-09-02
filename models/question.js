var mongoose = require("mongoose");


QuestionSchema=new mongoose.Schema({
question:String,
author: {
    id: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User"
    },
    username: String,   
 },
 answers:[
      {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Answer"
    },
   
 ],
 category:String

})


module.exports = mongoose.model("Question", QuestionSchema);