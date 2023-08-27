import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Signup.css'
import AOS from 'aos';
import 'aos/dist/aos.css';
const Signup = () => {
    const [credentials, setCredentials] = useState({ name: "", email: "", pass: "", phone: "", location: "" });
    let navigate = useNavigate();
    const form = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5004/api/auth/createuser", {
                method: 'POST',
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ username: credentials.username, email: credentials.email, pass: credentials.pass })
            });

            const json = await response.json();
            // console.log(json);
            
            if (!json.success) {
                // alert('Enter Valid Credentials')
                // setAlert(true)
                // showAlert('danger', 'Enter Valid Credentials')
            }
            
            else {
                // setAlert(true)
                // showAlert('success', 'Account Created Successfully')
                navigate('/')

            }


        } catch (error) {
            console.log(error);
        }
    }
    
    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }
    

    useEffect(() => {
        AOS.init({ duration: 1000, });
    }, [])

  return (
    <div>
        <div className='grandfather'>

<div className='form-container' data-aos="slide-down">
    <div className='container inner-cont'>
        <h2 className='text-center' style={{ marginTop: '4vh' }}>Sign Up</h2>
        <form method="post" ref={form} onSubmit={handleSubmit}>
            <div className='container fields'>

                <div className="form-group">
                    <label htmlFor="name">Username</label>
                    <input type="text" className="form-control" id="username" aria-describedby="username" name='username' onChange={handleChange} value={credentials.username} placeholder="Enter Username" />
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" required name='email' onChange={handleChange} value={credentials.email} placeholder="Enter email" />
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input type="password" className="form-control" id="password" name='pass' placeholder="Password" onChange={handleChange} value={credentials.pass} required minLength={5} />
                </div>
                <center><button type="submit" className="btn btn-primary signupbtn">Sign Up</button>
                </center>
            </div>
            <center>

                <div className='form-caption my-4'>
                    <p style={{ marginTop: '0px' }}><b> Already Have An Account?<Link to="/" style={{ color: 'black' }}> Login</Link></b></p>
                </div>
            </center>
        </form>
    </div>
</div>
</div>
    </div>
  )
}

export default Signup