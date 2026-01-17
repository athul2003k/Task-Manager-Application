require("dotenv").config({ path: "../.env" });
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

connectDB();

//create http server
const server = http.createServer(app);

//attatch socket

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

//making socket for conrtollers

app.set("io", io);

//socket connection

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", ({ userId, role }) => {
        socket.join(userId);
        console.log(`User joined room: ${userId}`);

        // Add admins to a dedicated admin room
        if (role === "ADMIN") {
            socket.join("admins");
            console.log(`Admin joined admins room: ${userId}`);
        }
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
})


server.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);