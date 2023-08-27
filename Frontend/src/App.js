import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom"
import Chat from './Component/Chat';
import Login from './Component/Login';
import Signup from './Component/Signup';
import Friend from './Component/Friend';
import Forgotpassword from './Component/ForgotPassword';
import Resetpassword from './Component/Resetpassword';

function App() {
  

  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Login />}></Route>
        <Route exact path='/Login' element={<Login />}></Route>
        <Route exact path='/chat' element={<Chat />}></Route>
        <Route exact path='/Signup' element={<Signup />}></Route>
        <Route exact path='/Friend' element={<Friend />}></Route>
        <Route exact path='/ForgotPassword' element={<Forgotpassword />}></Route>
        <Route exact path='/Resetpassword/:id/:token' element={<Resetpassword />}></Route>

        {/* <Route exact path='/Login' element={<Login />}></Route> */}
      </Routes>
    </Router>
  );
}

export default App;
