import React, { useEffect, useState } from 'react'
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';


function Forgotpassword() {
    useEffect(() => {
      AOS.init();
    }, [])

    const navigate = useNavigate();

    const [emaill, setemaill] = useState('');
    const [verified, setVerified] = useState(false)

    const handleSubmit = async(event) => {
        event.preventDefault();
        const response = await fetch('http://localhost:5004/api/auth/sendLink',{
            method:'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({email : emaill})
        }) 

        console.log(response)
        if(response.status == 200){
            setVerified(true);
        }

        else{
            alert('No user found with this email')
            setVerified(false)
        }
    }
    return (
        <>
        <div className='login-grandfather-cont'>
        <div className='login-container' data-aos='slide-right' data-aos-duration='1000'>
            <div className='container my-3 inner-login-container' >
                <h2 className='my-4'>Forgot Password</h2>
                {!verified ? 
                <form method='post'>
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" value={emaill} onChange={(e) => setemaill(e.target.value)} name='email' aria-describedby="emailHelp" required placeholder="Enter email" />
                    </div>

                    <center>
                        <button type="submit" className="btn btn-primary mt-2" onClick={handleSubmit} >Send Password</button>
                    </center>
                </form>:
                <form method='post'>
                    <div className='image-cont my-4'>
                    <span style={{display:'flex', justifyContent:'center', alignItems: 'center'}}><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Eo_circle_green_white_checkmark.svg/2048px-Eo_circle_green_white_checkmark.svg.png' width = '30%' alt='tick'/>
                    </span></div>

                    <center>
                        <div className="" >Password link is sent Successfully . Please check your email</div>
                    </center>
                </form>

} 

            </div>
        </div>
    </div>
    </>

    )
}

export default Forgotpassword