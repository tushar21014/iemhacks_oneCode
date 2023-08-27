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
    
    socket.on('connectionRequest', ({ targetId, showPopup }) => {
        io.to(targetId).emit('showConnectionRequestPopup', { showPopup });
      });

      socket.on('acceptConnectionRequest', async ({authToken, current_connection}) => {

        // Call the /makeFriend endpoint using fetch or axios

        const response = await fetch("http://localhost:5004/api/auth/makeFriend", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "auth-Token": authToken
          },
          body: JSON.stringify({
            current_connection: current_connection, 
            authToken: authToken
          })
        });
    
        const newData = await response.json();
        console.log(newData);
      });

      socket.on('rejectConnectionRequest', async ({targetId, authToken}) => {
        io.to(targetId).emit('update', { socketId: targetId, authToken: authToken });
      })

    socket.on('update', async ({ socketId, authToken }) => {
        console.log("Current ID " + socketId)

        const response = await fetch('http://localhost:5004/api/auth/reactionUpdate', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "auth-Token": authToken
            },
            body: JSON.stringify({ targetID: socketId })
        })

        if (!response.success) {
            console.log('Error updating status:', response.statusText);
        }

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

        if(data.usersAvailables !== false){
            socket.emit('matchedUser', data.socketId);
            io.to(data.socketId).emit('matchedUser', socket.id);
            console.log("Target User " + data.socketId);
            socket.emit('welcome', { user: "User", message: "Another Homosapien is here! Please Feel Free to talk" });
            io.to(data.socketId).emit('welcome', { user: "User", message: "Another Homosapien is here! Please Feel Free to talk" });
        }

    })



    socket.on('message', ({ message, id, targetId }) => {
        console.log()
        io.to(targetId).emit('sendMessage', { message, id, targetId, username : "Anonymous" });
        io.to(id).emit('sendMessage', { message, targetId, id });
    });


    socket.on('disconnect', async () => {
        console.log("I am auth", socket.id)
        const response = await fetch('http://localhost:5004/api/auth/updateDisconnect', {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({socketId: socket.id})
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

