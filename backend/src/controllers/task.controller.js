const Task = require("../models/Task");

// ADMIN create task
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create({
            ...req.body,
            createdBy: req.dbUser._id,
        });

        // Populate task before emitting
        await task.populate("assignedTo");

        const io = req.app.get("io");

        // Emit to assigned user
        if (task.assignedTo) {
            io.to(task.assignedTo._id.toString()).emit("taskCreated", { task });
        }

        // Emit to all admins
        io.to("admins").emit("taskCreated", { task });

        res.json(task);
    } catch (err) {
        res.status(400).json({ message: "Task creation failed" });
    }
};

// ADMIN / USER get tasks
exports.getTasks = async (req, res) => {
    try {
        const filter =
            req.dbUser.role === "ADMIN"
                ? {}
                : { assignedTo: req.dbUser._id };

        const tasks = await Task.find(filter).populate("assignedTo");
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch tasks" });
    }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (
            req.dbUser.role !== "ADMIN" &&
            !task.assignedTo.equals(req.dbUser._id)
        ) {
            return res.status(403).json({ message: "Forbidden" });
        }

        task.status = req.body.status;
        await task.save();

        // Populate task before emitting
        await task.populate("assignedTo");

        const io = req.app.get("io");
        // Emit to assigned user
        io.to(task.assignedTo._id.toString()).emit("taskUpdated", { task });

        // Emit to all admins
        io.to("admins").emit("taskUpdated", { task });

        res.json(task);
    } catch (err) {
        res.status(400).json({ message: "Status update failed" });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        if (req.dbUser.role !== "ADMIN") {
            return res.status(403).json({ message: "Admins only" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const io = req.app.get("io");

        // Emit to assigned user
        io.to(task.assignedTo.toString()).emit("taskDeleted", {
            taskId: task._id,
        });

        // Emit to all admins
        io.to("admins").emit("taskDeleted", {
            taskId: task._id,
        });

        await task.deleteOne();

        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Task deletion failed" });
    }
};
