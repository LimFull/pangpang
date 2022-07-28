import './App.css';
import Snakes from "./snake/Snakes";
import Rooms from "./rooms/Rooms";
import Room from "./rooms/Room";
import {HashRouter as Router, Route} from 'react-router-dom';
import {Routes} from "react-router";
import {SnakeGame} from "./snake/v2/SnakeGame";
import SessionProvider from "./session/SessionProvider";

function App() {
    return (
        <SessionProvider>
            <Router>
                <Routes>
                    <Route path={'/'} element={<Rooms/>}/>
                    <Route path={'/rooms/:roomNumber'} element={<Room/>}/>
                    <Route path={'/snakes'} element={<Snakes/>}/>
                    <Route path={'/snakes-v2'} element={<SnakeGame/>}/>
                </Routes>
            </Router>
        </SessionProvider>
    );
}

export default App;
