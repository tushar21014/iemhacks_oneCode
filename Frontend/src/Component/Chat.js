import React, { useEffect, useState } from 'react';
import { user } from '../Component/Join';
import socketIo from 'socket.io-client';
import Message from './Message';

import Friend from './Friend';
import { useNavigate } from 'react-router-dom';

const ENDPOINT = "http://localhost:4500/";
let socket;
const Chat = () => {
  const navigate = useNavigate()
  { !localStorage.getItem('auth-Token') ? <>{navigate('/Login')}</> : <></> }
  const [messages, setMessages] = useState([]);
  const [id, setId] = useState("");
  const [targetId, setTargetId] = useState("");

  const [showConnectionRequestPopup, setShowConnectionRequestPopup] = useState(false);

  const sendConnectionRequest = () => {
    console.log("Sending Connection Request: ", targetId);
    socket.emit('connectionRequest', { targetId, showPopup: true });
  };
  
  const handleConnectionAcceptance = () => {
    socket.emit('acceptConnection', { sender: user });
  };

  const send = () => {
    const message = document.getElementById('chatInput').value;
    console.log("ID: ", id)
    console.log("Target ID: ", targetId)
    socket.emit('message', { user, message, id, targetId });
    document.getElementById('chatInput').value = "";
  };


  const findUser = () => {
    socket.emit('findUser', localStorage.getItem('auth-Token'));
    setMessages([])
  };

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ['websocket'] });

    socket.on('connectionRequestReceived', ({ sender, socketID, showPopup }) => {
      if (showPopup) {
        setShowConnectionRequestPopup(true);
      }
    });

    socket.on('connect', () => {
      console.log("connected");
      setId(socket.id);
      console.log(socket.id);
      socket.emit('joined', { user: user, authToken: localStorage.getItem('auth-Token') });
    });

    socket.on('welcome', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      console.log(data.user, data.message);
    });

    socket.on('userJoined', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      // console.log(data.user, data.message);
    });

    socket.on('leave', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      console.log(data.user, data.message);
    });

    socket.on('sendMessage', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    
    socket.on('matchedUser', (data) => {
      
      setTargetId(data);
      console.log("Found a match", data);
    });


    // ! Connection Request Part
    socket.on('showConnectionRequestPopup', ({ showPopup }) => {
      if (showPopup) {
        setShowConnectionRequestPopup(true);
      }
    });

    socket.on('onRequestAccept', async () => {
      setShowConnectionRequestPopup(false);
      
    });

    socket.on('onRequestReject', async () => {
      setShowConnectionRequestPopup(false);
    });
    

    socket.on('disconnect', () => {
      console.log("I am called")
      socket.emit('disconnection', { authToken: localStorage.getItem('auth-Token') })
      // Perform any cleanup or logging needed
      console.log('Disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const onRequestAccept = () => {
    socket.emit('acceptConnectionRequest', {authToken: localStorage.getItem('auth-Token'), current_connection: id});
  };
  
  const onRequestReject = () => {
    socket.emit('rejectConnectionRequest');
  };

  return (
    <div>
      {user}
      <div className='chatBox'>
        {messages.map((item, key) => <Message key={key} message={item.message} user={item.username || "You"} />)}
      </div>
      <div className='inputBox'>
        <input type="text" id="chatInput" />
      </div>
      <button onClick={send}>Send</button>
      <button onClick={findUser}>Find Someone</button>
      <button id='connectButton' onClick={sendConnectionRequest}>Connect</button>

      {showConnectionRequestPopup && (
        <Friend
          onRequestAccept={() => {
            socket.emit('onRequestAccept');
            setShowConnectionRequestPopup(false);
          }}
          onRequestReject={() => {
            socket.emit('rejectConnectionRequest');
            setShowConnectionRequestPopup(false);
          }}
        />
      )}

    </div>
  );
};

export default Chat;

