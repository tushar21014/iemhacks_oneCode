import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
// import { Link, useNavigate } from 'react-router-dom';


function Resetpassword() {
    const navigate = useNavigate();
    const [pass, setPass] = useState('')
    // const [cpass, setCpass] = useState('')
    const id = useParams();

    const handleVerify = () => {
        const passs = document.getElementById('passs').value;
        const cpasss = document.getElementById('cpasss').value;

        if(passs.length >= 5 && passs === cpasss)
        {
            handleSubmit();
            navigate('/Login')

        }

        else{
            alert('Password and confirm password should be same')
            // console.log('Password and Confirm Password do not match or are less than 5 characters long');
            // alert('Are mc 5 letter to daal de')
        }

    }
    const handleSubmit = async () => {
        console.log(id);
        const response = await fetch(`http://localhost:5000/api/auth/changePass/${id.id}/${id.token}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pass: pass })
        });

        const data = await response.json();
        // console.log(data)
        if (data){
            console.log(data)
            navigate('/Login')
            alert('Password Changed Successfully')
        }
        else{
            console.error()
        }
    }

    return (
        <>
            {/* {alert && <div style={{display:'none'}}>{alert.msg}</div>} */}
            <div className='login-grandfather-cont'>
                <div className='login-container'>
                    <div className='container my-3 inner-login-container' >
                        <h2 className='my-4'>Reset Password</h2>
                        <form method='put' name='formm'>
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Password</label>
                                <input type="password" className="form-control" minLength={5} id='passs' name='pass' onChange={(e) => setPass(e.target.value)} value={pass} aria-describedby="emailHelp" required placeholder="Password" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Confirm Password</label>
                                <input type="password" className="form-control" name='cpass' id='cpasss' aria-describedby="emailHelp" required placeholder="Confirm Password" />
                            </div>

                            <center>
                                <button type="submit" className="btn btn-primary mt-2" onClick={handleVerify}>Update Password</button>
                            </center>
                        </form>

                    </div>
                </div>
            </div>
        </>

    )
}

export default Resetpassword