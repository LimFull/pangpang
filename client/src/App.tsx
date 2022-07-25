import './App.css';
import Snakes from "./snake/Snakes";
import Rooms from "./rooms/Rooms";
import Room from "./rooms/Room";
import {HashRouter as Router, Route} from 'react-router-dom';
import {Routes} from "react-router";
import {SnakeGame} from "./snake/v2/SnakeGame";
import {Provider} from "react-redux";
import store from "./store";
import {persistStore} from "redux-persist";
import {PersistGate} from "redux-persist/integration/react";
import SessionProvider from "./session/SessionProvider";


const persistor = persistStore(store);

function App() {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}/>
            <SessionProvider>
                <Router>
                    <Routes>
                        <Route path={'/'} element={<Rooms/>}/>
                        <Route path={'/rooms/:id'} element={<Room/>}/>
                        <Route path={'/snakes'} element={<Snakes/>}/>
                        <Route path={'/snakes-v2'} element={<SnakeGame/>}/>
                    </Routes>
                </Router>
            </SessionProvider>
        </Provider>
    );
}

export default App;
