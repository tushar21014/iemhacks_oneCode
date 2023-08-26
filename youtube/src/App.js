import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom"
import Chat from './Component/Chat';
import Login from './Component/Login';
function App() {
  

  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Login />}></Route>
        <Route exact path='/chat' element={<Chat />}></Route>
        {/* <Route exact path='/Login' element={<Login />}></Route> */}
      </Routes>
    </Router>
  );
}

export default App;
