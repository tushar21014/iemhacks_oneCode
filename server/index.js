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
        console.log("Target User " + data.socketId);
        // console.log(data)
        socket.emit('matchedUser', data.socketId);

    })


   
//   socket.on('friendRequest', async (data) => {
//     const { targetSocketId, requestId } = data;

//     try {
//       const targetUser = await User.findOne({ socketId: targetSocketId });

//       if (!targetUser) {
//         socket.emit('friendRequestResponse', { message: 'Target user not found' });
//         return;
//       }

//       // Emit the request to the target user's socket
//       io.to(targetSocketId).emit('friendRequestReceived', { requestId });

//       // Listen for the response from the target user
//       socket.on('friendRequestAction', async (response) => {
//         if (response.accepted) {
//           targetUser.friends.push(requestId);
//           await targetUser.save();
//           socket.emit('friendRequestResponse', { message: 'Friend request accepted' });
//         } else {
//           socket.emit('friendRequestResponse', { message: 'Friend request declined' });
//         }
//       });
//     } catch (error) {
//       console.log(error);
//       socket.emit('friendRequestResponse', { message: 'Error while processing request' });
//     }
//   });

    socket.on('message', ({ message, id, targetId }) => {
        io.to(targetId).emit('sendMessage', { message, id, targetId });
        io.to(id).emit('sendMessage', { message, targetId, id });
    });
    


    socket.on('disconnect', async (req,res) => {
        if (users[socket.id]) {

            console.log(`${users[socket.id]} has left`);
            socket.broadcast.emit('leave', { user: `${users[socket.id]}`, message: "Has left the chat" })
            delete users[socket.id];
        }

        // const response = await fetch('http://localhost:5004/api/auth/updateDisconnect', {
        //     method: 'PUT',
        //     headers: {
        //       "Content-Type": "application/json",
        //       "auth-Token": authToken  // Use the stored authToken
        //     }
        //   });
    
        //   if (response.ok) {
        //     res.json({ message: "User Discconnected" });
        //   }
    });

});

const port = process.env.SERVER_PORT;
server.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
});

app.listen(process.env.PORT, () => {
    console.log(`Backend listening on port 5004`)
})

