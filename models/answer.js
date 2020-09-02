var mongoose = require("mongoose");


AnswerSchema=new mongoose.Schema({
answer:String,
author: {
   id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },
   username: String   
},
question:[{
   type: mongoose.Schema.Types.ObjectId,
   ref: "Question"
}],
likes: [],
dislikes: []

});


module.exports = mongoose.model("Answer", AnswerSchema);