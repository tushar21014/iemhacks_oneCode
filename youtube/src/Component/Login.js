import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({email:"", pass:""});
    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5004/api/auth/login", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: credentials.email, pass: credentials.pass })
            });

            const json = await response.json();
            console.log(json);
            if (!json.success) {
                // alert('Invaid Credentials')
            }

            if (json.success) {
                localStorage.setItem('auth-Token', json.authToken)
                localStorage.setItem('email', credentials.email);
                if(json.adminId){
                    localStorage.setItem('admin',json.adminId);
                }
                navigate('/chat')
            }
        } catch (error) {
            console.log(error);
        }

    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

  return (
    <div>
        <form onSubmit={handleSubmit}>
        <input type="text" name='email' onChange={onChange} id='inputEmail'/>
        <input type="text" name='pass' onChange={onChange} id='inputPass'/>
        <button type="submit" className="btn btn-primary mt-2">Log In</button>

        </form>
    </div>
  )
}


export default Login