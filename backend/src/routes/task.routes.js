const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const taskController = require("../controllers/task.controller");


router.post(
    "/",
    auth,
    role("ADMIN"),
    taskController.createTask
);

router.get(
    "/",
    auth,
    taskController.getTasks
);

router.patch(
    "/:id/status",
    auth,
    taskController.updateTaskStatus
);

router.delete(
    "/:id",
     auth,
    taskController.deleteTask
);


module.exports = router;