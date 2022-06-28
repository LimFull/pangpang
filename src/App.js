import './App.css';
import Snakes from "./snake/Snakes";
import Rooms from "./rooms/Rooms";
import Room from "./rooms/Room";
import PageWrapper from "./page/PageWrapper";

import {Routes} from "react-router";
import {BrowserRouter, Route} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <PageWrapper>
        <Routes>
          <Route path={'/'} element={<Rooms/>}/>
          <Route path={'/room'} element={<Room/>}/>
          <Route path={'/snakes'} element={<Snakes/>}/>
        </Routes>
      </PageWrapper>
    </BrowserRouter>

  );
}

export default App;
