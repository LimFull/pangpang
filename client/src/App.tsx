import './App.css';
import Snakes from "./snake/Snakes";
import Rooms from "./rooms/Rooms";
import Room from "./rooms/Room";
import PageWrapper from "./page/PageWrapper";
import {HashRouter as Router, Route} from 'react-router-dom';
import {Routes} from "react-router";
import {SnakeGame} from "./snake/v2/SnakeGame";
import {Provider} from "react-redux";
import store from "./store";


function App() {
    return (
        <Provider store={store}>
            <Router>
                <PageWrapper>
                    <Routes>
                        <Route path={'/'} element={<Rooms/>}/>
                        <Route path={'/room'} element={<Room/>}/>
                        <Route path={'/snakes'} element={<Snakes/>}/>
                        <Route path={'/snakes-v2'} element={<SnakeGame/>}/>
                    </Routes>
                </PageWrapper>
            </Router>
        </Provider>
    );
}

export default App;
