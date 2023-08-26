const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');
const connectToMongo = require('./db');
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
        console.log(`${user} has joined`);

        const response = await fetch('http://localhost:5004/api/auth/updateOnlinestatus', {
            method: 'PUT',
            headers: {
                "Content-Type":"application/json",
                "auth-Token": authToken
            },
            body:JSON.stringify({socketId: socket.id})
        })
        
        if(!response.ok){
            console.log('Error updating status:', response.statusText);
        }
        
        
        // console.log("Api hit")
            socket.broadcast.emit('userJoined', { user: "Admin", message: `${user} has joined the chat` });
            socket.emit('welcome', { user: user, message: "Welcome to the chat" });

            
    });

    socket.on('message', ({ message, id,targetId }) => {
        console.log(id)
        console.log(targetId)
        io.to(targetId).emit('sendMessage', { user: users[id], message, id, targetId })
    })
    
    socket.on('findUser',async (authToken)=>{
        const finduser = await fetch('http://localhost:5004/api/auth/findFreeuser', {
            method: 'POST',
            headers: {
                "Content-Type":"application/json",
                "auth-Token": authToken
            }
        })
    
        let data = await finduser.json();
        console.log("Target User " + data.socketId);
        // console.log(data)
        socket.emit('matchedUser', data.socketId);

    })

    // socket.on('message', ({ message, targetUserId }) => {
        // Find the target socket ID using the target user ID
        // const targetSocketId = Object.keys(activeUsers).find(socketId => activeUsers[socketId] === targetUserId);

    //     if (targetUserId) {
    //         io.to(targetUserId).emit('privateMessage', { user: users[socket.id], message });
    //     } else {
    //         // Handle case when target user is not online
    //     }
    // });
    
    socket.on('disconnect', () => {
        if (users[socket.id]) {
            
            console.log(`${users[socket.id]} has left`);
            socket.broadcast.emit('leave', { user: `${users[socket.id]}`, message: "Has left the chat" })
            delete users[socket.id];
        }
    });

});

const port = 4500;
server.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
});

app.listen(5004, () => {
    console.log(`Backend listening on port 5004`)
})

