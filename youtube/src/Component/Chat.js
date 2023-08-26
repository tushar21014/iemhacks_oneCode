import React, { useEffect, useState } from 'react';
import { user } from '../Component/Join';
import socketIo from 'socket.io-client';
import Message from './Message';

const ENDPOINT = "http://localhost:4500/";
let socket;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [id, setId] = useState("");
  const [targetId, setTargetId] = useState("");

  const send = () => {
    const message = document.getElementById('chatInput').value;
    socket.emit('message', { user, message, id, targetId });
    document.getElementById('chatInput').value = "";
  };

  const findUser = () => {
    socket.emit('findUser', localStorage.getItem('auth-Token'));
  };

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ['websocket'] });

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
      console.log(data.user, data.message);
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

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      {user}
      <div className='chatBox'>
        {messages.map((item, key) => <Message key={key} message={item.message} user={item.user} />)}
      </div>
      <div className='inputBox'>
        <input type="text" id="chatInput" />
      </div>
      <button onClick={send}>Send</button>
      <button onClick={findUser}>Find Someone</button>
    </div>
  );
};

export default Chat;
