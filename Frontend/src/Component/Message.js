import React from 'react'
import "../styles/Message.css"

const Message = (props) => {
    
    if (props.user) {
        return (
            <>
            <div className="smn-container smn-darker chatmessage" style={{justifySelf: props.user === "You" ? "right" : "left", padding: "10px 10px 0px 10px", backgroundColor: props.user === "You" ? "#007aff" : "#fff", color: props.user === "You" ? "#fff" : "#000", borderRadius: props.user === "You" ? "20px 20px 2px 20px" : "20px 20px 20px 2px "}}>
                    <p>{props.user} : {props.message}</p>
                <span className="smn-time-right">{props.date}</span>
            </div>
</>
        )
    }
    else {
        return (
            <div className="smn-container">
            <p>You: {props.message}</p>
        <span className="smn-time-left">{props.date}</span>
    </div>
        )
    }
}

export default Message