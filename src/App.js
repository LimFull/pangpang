import './App.css';
import Snakes from "./snake/Snakes";

import {Routes} from "react-router";
import {BrowserRouter, Route} from "react-router-dom";
import {Rooms} from "./rooms/Rooms";
import {PageWrapper} from "./page/PageWrapper";


function App() {
    return (
        <BrowserRouter>
            <PageWrapper>

                <Routes>
                    <Route path={'/'} element={<Rooms/>}/>
                    <Route path={'/snakes'} element={<Snakes/>}/>
                </Routes>
            </PageWrapper>
        </BrowserRouter>

    );
}

export default App;
