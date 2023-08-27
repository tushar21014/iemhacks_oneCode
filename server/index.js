const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');
const connectToMongo = require('./db');
const User = require('./Models/User');
require("dotenv").config()

connectToMongo();

const app = express();
app.use(cors());
app.use(express.json());
const users = {}; // Use an object to store user data
app.use('/api/auth', require("./Routes/auth"))

app.get("/", (req, res) => {
    res.send("Socket Io is working");
});


const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
    console.log("New Connection");
    
      socket.on('acceptConnectionRequest', async () => {
        // io.to(socket.id).emit('onRequestAccept');
        io.broadcast.emit('onRequestAccept');
    
      });
    
      socket.on('rejectConnectionRequest', async () => {
        io.to(socket.id).emit('onRequestReject');
    
      });

    socket.on('connectionRequest', async ({ targetId, sender, socketID, authToken }) => {
        io.to(targetId).emit('connectionRequestReceived', { sender, socketID });
        socket.on('onRequestAccept', async()=>{
            let res = await fetch("http://localhost:5004/api/auth/makeFriend", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "auth-Token": authToken
                },
                body: JSON.stringify({
                    current_connection: targetId,
                    user: sender,
                    socketId: socketID,
                    auth: authToken
                })
            })
            let data = await res.json()
            console.log(data);
        })
    });

    socket.on('joined', async ({ user, authToken }) => {
        users[socket.id] = user;
        console.log("Current User " + socket.id)
        console.log(`User has joined`);

        const response = await fetch('http://localhost:5004/api/auth/updateOnlinestatus', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "auth-Token": authToken
            },
            body: JSON.stringify({ socketId: socket.id })
        })

        if (!response.ok) {
            console.log('Error updating status:', response.statusText);
        }


        // console.log("Api hit")
        // broadcast: Apna user chod ke baaki sbko msg jayega
        // emit : Send
        socket.emit('userJoined', { user: "Admin", message: `${user} has joined the chat` });
        socket.emit('welcome', { user: user, message: "Welcome to the chat" });


    });


    socket.on('findUser', async (authToken) => {
        const response = await fetch('http://localhost:5004/api/auth/findFreeuser', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "auth-Token": authToken
            }
        })

        let data = await response.json();
        socket.emit('matchedUser', data.socketId);
        io.to(data.socketId).emit('matchedUser', socket.id);
        console.log("Target User " + data.socketId);
        console.log("D:", data)
        // socket.emit('matchedUser', data.socketId);

    })



    socket.on('message', ({ message, id, targetId }) => {
        console.log()
        io.to(targetId).emit('sendMessage', { message, id, targetId });
        io.to(id).emit('sendMessage', { message, targetId, id });
    });


    socket.on('disconnection', async ({authToken}) => {
        const response = await fetch('http://localhost:5004/api/auth/updateDisconnect', {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            "auth-Token": authToken
          }
        });
        let data = await response.json();
        if (response.status === 200) {
          console.log("User Disconnected");
        }
        else{
            console.log(data)
        }

        if (users[socket.id]) {
          console.log(`${users[socket.id]} has left`);
          socket.broadcast.emit('leave', { user: users[socket.id], message: "Has left the chat" });
          delete users[socket.id];
      
          // Get the authToken from the socket handshake query
          const authToken = socket.handshake.query.authToken;
      
        }
      });
      

});

const port = process.env.SERVER_PORT;
server.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
});

app.listen(process.env.PORT, () => {
    console.log(`Backend listening on port 5004`)
})

