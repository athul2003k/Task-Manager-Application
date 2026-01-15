const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {type:String ,required: true},
    description:String,
    assignedTo: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
    status:{
        type:String,
        enum:["TODO","IN_PROGRESS","COMPLETED"],
        default:"TODO",
    },
    deadline: Date,
    cratedBy:{type:mongoose.Schema.Types.ObjectId, ref:"User"}, 
    },   
    {timestamps: true}    
);

module.exports = mongoose.model("Task",taskSchema);