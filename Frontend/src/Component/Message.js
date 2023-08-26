import React from 'react'

const Message = (props) => {
    if (props.user) {
        return (
            <div>{props.user} : {props.message}</div>
        )
    }
    else {
        return (
            <div>You : {props.message}</div>
        )
    }
}

export default Message