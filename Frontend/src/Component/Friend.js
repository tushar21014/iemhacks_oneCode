import React from 'react';
import '../styles/Friend.css'
const Friend = ({ onRequestAccept, onRequestReject }) => {
  return (
    <div className="popup">
        <div className="card">
        <div className="imgBox">
            <svg viewBox="0 0 16 16" className="bi bi-person-circle" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path>
                <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" fillRule="evenodd"></path>
            </svg>
        </div>
        <div className="name">
            <p className="p1">Annonymous</p>
            <p className="p2">Incoming Request</p>
        </div>
        <div className="caller">
            <span id="pick" className="callerBtn" onClick={onRequestAccept}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone-fill" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"></path>
                </svg>
            </span>
            <span id="end" className="callerBtn" onClick={onRequestReject}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone-fill" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"></path>
                </svg>
        </span></div>
    </div>
{/* 
      <h3>You received a connection request</h3>
      <button onClick={onRequestAccept}>Accept</button>
      <button onClick={onRequestReject}>Reject</button> */}
    </div>
  );
};

export default Friend;
