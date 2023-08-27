import React, { useEffect, useState } from 'react'
import '../styles/login.css'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
const Login = () => {
  const [value, setValue] = useState('')
  const [credentials, setCredentials] = useState({ email: "", pass: "" });
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
      // console.log(json);
      if (!json.success) {
        // alert('Invaid Credentials')
      }

      if (json.success) {
        localStorage.setItem('auth-Token', json.authToken)
        localStorage.setItem('email', credentials.email);
        if (json.adminId) {
          localStorage.setItem('admin', json.adminId);
        }
        navigate('/chat')
      }
    } catch (error) {
      console.log(error);
    }

  }
  const showPass = () => {
    const cont = document.getElementById('exampleCheck1');
    const passCont = document.getElementById('pass');
    if (cont.checked)
      passCont.type = 'text';
    else
      passCont.type = 'password'
  }
  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }
  useEffect(() => {
    AOS.init({ duration: 1000, });
}, [])
  return (

    <section>
      {/* <form onSubmit={handleSubmit}>
        <input type="text" name='email' onChange={onChange} id='inputEmail'/>
        <input type="text" name='pass' onChange={onChange} id='inputPass'/>
        <button type="submit" className="btn btn-primary mt-2">Log In</button>

        </form> */}
      <div className='login-grandfather-cont'>
        <div className='login-container' data-aos='fade-right'>
          <div className='container my-3 inner-login-container' >
            <h2 className='my-4'>Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="exampleInputEmail1">Email address</label>
                <input type="email" className="form-control" id="exampleInputEmail1" name='email' required value={credentials.email} aria-describedby="emailHelp" onChange={onChange} placeholder="Enter email" />
              </div>
              <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input type="password" className="form-control" id="pass" value={credentials.pass} required name='pass' onChange={onChange} placeholder="Password" />
              </div>
              <div className="form-check">
                <input type="checkbox" className="form-check-input forgot" onClick={showPass} id="exampleCheck1" />
                <label className="form-check-label" htmlFor="exampleCheck1">Show Password</label>
                <Link to='/Forgotpassword' className='forgotpass'>Forgot Password?</Link>
              </div>

              <center>
                <button type="submit" className="btn btn-primary mt-2">Log In</button>
              </center>
            </form>
            <hr />
            <div>

              {value ? navigate('/') :
                // <button onClick={handleClick}>Continue With Google</button>
                <div className='google-cont'>

                  {/* <div className="google-btn" onClick={handleClickk}>
                                        <div className="google-icon-wrapper">
                                            <img className="google-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt='google-icon' />
                                        </div>
                                        <p className="btn-text text-right"><b>Sign in with google</b></p>
                                    </div> */}

                </div>
              }
            </div>
            <center>

              <div className='form-caption my-4'>
                <p style={{ marginTop: '0px' }}><b> Don't Have An Account?<Link to="/Signup" style={{ color: 'black' }}> Signup</Link></b></p>
              </div>
            </center>

          </div>
        </div>
      </div>
    </section>
  )
}


export default Login