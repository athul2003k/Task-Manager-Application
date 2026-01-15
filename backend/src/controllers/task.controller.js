const Task = require("../models/Task");

//ADMIN create task

exports.createTask = async (req,res) =>{
    try{
        const task = await Task.create({
            ...req.body,
            createdBy: req.dbUser._id,
        });

        res.json(task);
    }catch(err) {
        res.status(400).json({message:"Task cration failed"});
    }
};


//ADMIN /USER get tasks

exports.getTasks = async (req,res)=>{
    try{
        const filter =
            req.dbUser.role === "ADMIN" ? {}:{assignedTo : req.dbUser._id};

        const tasks = await Task.find(filter).populate("assignedTo");
        res.json(tasks);
    } catch(err){
        res.status(500).json({message: "Failed to featch tasks"});
    }
};


//update task status

exports.updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // USER can update only their own task
        // ADMIN can update any task
        if (
            req.dbUser.role !== "ADMIN" &&
            !task.assignedTo.equals(req.dbUser._id)
        ) {
            return res.status(403).json({ message: "Forbidden" });
        }

        task.status = req.body.status;
        await task.save();

        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Status update failed" });
    }
};

//Delete the task

exports.deleteTask = async (req, res) => {
    try {
        // Allow only ADMIN
        if (req.dbUser.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        await task.deleteOne();

        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Task deletion failed" });
    }
};