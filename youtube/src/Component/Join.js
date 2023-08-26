import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export let user = ''; // Export user variable

const Join = () => {
    const [enteredUser, setEnteredUser] = useState('');

    const sendUser = () => {
        user = enteredUser; // Assign the entered value to the exported user variable
        setEnteredUser(''); // Clear enteredUser state
    };
    
    return (
        <div>
            <input id='textInput' type="text" value={enteredUser} onChange={(e) => setEnteredUser(e.target.value)} />
            <Link to='/chat' onClick={(e)=> !enteredUser? e.preventDefault():null}>
                <button onClick={sendUser} className='joinBtn'>Login</button>
            </Link>
        </div>
    );
}

export default Join;
