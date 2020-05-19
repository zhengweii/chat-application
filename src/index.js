const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

// Local imports
const generateMessage = require("./utils/message");
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require("./utils/users");

const PORT = process.env.PORT;

const app = express();
app.use(express.static(path.join(__dirname, "../public")));
const server = http.createServer(app);
const io = socketio(server);

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

io.on("connection", socket => {
    socket.on("join", (displayName, room, callback) => {
        const {
            error,
            user
        } = addUser(socket.id, displayName, room);

        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.displayName} has joined the chat`));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            const {
                displayName,
                room
            } = user;

            io.to(room).emit("message", generateMessage("Admin", `${displayName} has left the chat`));
            io.to(room).emit("roomData", {
                room,
                users: getUsersInRoom(room)
            });
        }
    });

    socket.on("sendMessage", (message, callback) => {
        if (message === "") {
            return callback("Message cannot be empty");
        }

        const user = getUser(socket.id);
        const {
            displayName,
            room
        } = user;
        io.emit("message", generateMessage(displayName, message));
        callback();
    });
});
