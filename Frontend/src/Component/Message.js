import React from 'react';

const Message = (props) => {
    const isCurrentUser = props.user === 'You'; // Modify 'You' according to how you represent the current user

    return (
        <div>
            {!isCurrentUser && <span>{props.user} : </span>}
            {isCurrentUser ? 'You' : props.message}
        </div>
    );
};

export default Message;
