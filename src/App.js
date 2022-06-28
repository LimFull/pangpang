import './App.css';
import Snakes from "./snake/Snakes";
import Rooms from "./rooms/Rooms";
import Room from "./rooms/Room";
import PageWrapper from "./page/PageWrapper";
import {HashRouter as Router, Route} from 'react-router-dom';
import {Routes} from "react-router";


function App() {
    return (
        <Router>
            <PageWrapper>
                <Routes>
                    <Route path={'/'} element={<Rooms/>}/>
                    <Route path={'/room'} element={<Room/>}/>
                    <Route path={'/snakes'} element={<Snakes/>}/>
                </Routes>
            </PageWrapper>
        </Router>

    );
}

export default App;
