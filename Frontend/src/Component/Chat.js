import React, { useEffect, useState } from 'react';
import { user } from '../Component/Join';
import socketIo from 'socket.io-client';
import Message from './Message';
import '../styles/Chat.css'
import Friend from './Friend';
import { useNavigate } from 'react-router-dom';
import { BsFillSendFill } from 'react-icons/bs'
import { ImExit } from 'react-icons/im'
const ENDPOINT = "http://localhost:4500/";
let socket;
const Chat = () => {
  const date = new Date().now;
  const navigate = useNavigate()
  const [friends, setFriends] = useState([])
  { !localStorage.getItem('auth-Token') ? <>{navigate('/Login')}</> : <></> }
  const [messages, setMessages] = useState([]);
  const [id, setId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const [showConnectionRequestPopup, setShowConnectionRequestPopup] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      send();
    }
  };

  const sendConnectionRequest = () => {
    console.log("Sending Connection Request: ", targetId);
    socket.emit('connectionRequest', { targetId, showPopup: true });
  };

  const handleConnectionAcceptance = () => {
    socket.emit('acceptConnection', { sender: user });
  };

  const getFriends = async () => {
    console.log("I am clicked ")
    try {
      let res = await fetch('http://localhost:5004/api/auth/getFriend', {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "auth-Token": localStorage.getItem('auth-Token')
        }
      })
      let data = await res.json();
      setFriends(data.friendUsernames)
      console.log("I am friends" + friends)
    } catch (error) {
      console.log(error)
    }
  }
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

  const Logout = () => {
    localStorage.clear();
    navigate('/')
  };

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ['websocket'] });
    getFriends()
    socket.on('connectionRequestReceived', ({ sender, socketID, showPopup }) => {
      if (showPopup) {
        setShowConnectionRequestPopup(true);
      }
    });

    socket.on('connect', () => {
      console.log("connected");
      setId(socket.id);
      console.log(socket.id);
      socket.emit('joined', { targetId, user: user, authToken: localStorage.getItem('auth-Token') });
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
      const date = new Date().toTimeString();
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
    socket.emit('acceptConnectionRequest', { authToken: localStorage.getItem('auth-Token'), current_connection: targetId });
    setShowConnectionRequestPopup(false);
    alert('You are now friends')
  };

  const onRequestReject = () => {
    socket.emit('rejectConnectionRequest', { targetId, authToken: localStorage.getItem('auth-Token') });
    setShowConnectionRequestPopup(false);
    navigate("/chat")
  };


  return (
    <div className='main-chat-container'>

      {/* ! LOGOUT BUTTON */}
      <button class="Btn" onClick={() => Logout()}>

        <div class="sign">
          <ImExit />
        </div>

        <div class="text">Logout</div>
      </button>




      <div className='tusharChatGrandfatherContainer container mx-4' >
        {user}
        <div className={`chatBox chatBoxContainer`}>
          {messages.map((item, key) => <Message date={date} key={key} message={item.message} user={item.username || "You"} />)}
        </div>

        {showConnectionRequestPopup && (
          <Friend
            onRequestAccept={() => {
              onRequestAccept()
            }}
            onRequestReject={() => {
              onRequestReject()
            }}
          />
        )}

      </div>
      <div className='tusharRow ml-4'>

        <div class="Message">
        <input title="Write Message" tabindex="i" pattern="\d+" placeholder="Message.." class="MsgInput" type="text" onKeyPress={e => handleKeyPress(e)} id="chatInput"/>
            <svg onClick={send} xmlns="http://www.w3.org/2000/svg" version="1.0" width="30.000000pt" height="30.000000pt" viewBox="0 0 30.000000 30.000000" preserveAspectRatio="xMidYMid meet" class="SendSVG">
              <g transform="translate(0.000000,30.000000) scale(0.100000,-0.100000)" fill="#ffffff70" stroke="none">
                <path d="M44 256 c-3 -8 -4 -29 -2 -48 3 -31 5 -33 56 -42 28 -5 52 -13 52 -16 0 -3 -24 -11 -52 -16 -52 -9 -53 -9 -56 -48 -2 -21 1 -43 6 -48 10 -10 232 97 232 112 0 7 -211 120 -224 120 -4 0 -9 -6 -12 -14z"></path>
              </g>
            </svg><span class="l"></span>
        </div>


        {/* <div className='inputBox'>
          <input type="text" id="chatInput" placeholder='Type your message...' onKeyPress={e => handleKeyPress(e)} />
          <button type="button" className="tusharSend mx-2" onClick={send}><BsFillSendFill className='sendIcon' style={{ color: "blue", border: "none" }} /></button>
        </div> */}

        <button className='btn btn-primary tusharFindSomeone mx-2' onClick={findUser}>Find Someone</button>




        <button className='btn btn-primary tusharConnect mx-2' id='connectButton' onClick={sendConnectionRequest}>Connect</button>
      </div>
      <div className={`friendsList ${isExpanded ? 'expanded' : ''}`} onClick={toggleExpansion}>
        <div className='topFriends'>
          <b>Friends</b>
        </div>
        <div className='friendList'>
          {friends && friends.map((e) => {
            return <div key={e}>{console.log(e)}
              {e}</div>
          })}
        </div>
      </div>
    </div>
  );
};

export default Chat;

