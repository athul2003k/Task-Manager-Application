const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firebaseUid: {type: String , required: true , unique: true,},
        name:String,
        email:String,
        role: {type: String , enum:["ADMIN","USER"], default: "USER"},
    },
    {timestamps:true}
);

module.exports = mongoose.model("User",userSchema);