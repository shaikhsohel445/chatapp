const socketio = require('socket.io');
const path = require("path");
const express = require("express");
const http = require("http");
const knex = require("knex");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 8080;
const views_path = path.join(__dirname, "/views");
const static_path = path.join(__dirname, "/static");

 const db = knex({
   client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'Sohel@123',
        database: 'chatApp'
    }
 });
// const knex = require('knex')({
//     client: 'pg',
//     connection: {
//         host: 'localhost',
//         user: 'postgres',
//         password: 'Sohel@123',
//         database: 'chatApp'
//     }
// });

const { joinUser, getCurrentUser, userLeave, roomUsers } = require("./utilities/user");

//* Static folder

app.use("/static", express.static(static_path));

//* view engine

app.set('view engine', 'ejs');
app.set("views", views_path);

//* Get 

app.get("/", (req, res) => {
    res.status(200).render("index.ejs");
});

app.get("/chatroom", (req, res) => {
    res.status(200).render("chat.ejs");
});

//* Web socket

io.on("connection", (socket) => {

    //* Join room
    socket.on("join-chat-room", ({ username, room }) => {

        const user = joinUser(socket.id, username, room);
        socket.join(user.room);

        //* Bot msg
        socket.emit("bot", { msg: `Welcome to ${username} !`, position: "middle" });

        socket.broadcast.to(user.room).emit("bot", { msg: `${user.username} joined the room`, position: "middle" });

        //* User and room info
        io.to(user.room).emit("room-users", {
            room: user.room,
            users: roomUsers(user.room)
        });

        //* Get previous messages for room
        db.select().from('messages').where({ room }).orderBy('timestamp', 'asc')
          .then(messages => {
            //* Send previous messages to user
            messages.forEach(message => {
              const { text, username, timestamp } = message;
              socket.emit("message", { msg: text, position: "left", username, timestamp });
            });
          });
    });

    //* User msg    
    socket.on("chat-msg", (msg) => {
        const user = getCurrentUser(socket.id);
        const username = user.username;
        const room = user.room;
        const timestamp = new Date();
        const message = { text: msg, username, room, timestamp };
        db.insert(message).into('messages')
          .then(() => {
            socket.broadcast.to(room).emit("message", { msg, position: "left", username, timestamp });
            socket.emit("receive", { msg, position: "right", username: "You", timestamp });
          });
    });

    //* Disconnect
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if (user) {
            socket.broadcast.to(user.room).emit("bot", { msg: `${user.username} left the room`, position: "middle" });

            //* User and room info
            io.to(user.room).emit("room-users", {
                room: user.room,
                users: roomUsers(user.room)
            })
        }
    });
});

//* listen
server.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});
