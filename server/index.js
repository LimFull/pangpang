const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

const routes = require("./routes");

app.use(cors());
app.use(routes);

const WebSocket = require('ws')
const wss = new WebSocket.Server({port: 8001})

const toObjectMessage = (msg) => {
  return JSON.parse(msg);
}

const toStringMessage = (type, data) => {
  return JSON.stringify({type: type, data: data})
}

// interface rooms {
//     [key:number]: {
//         title:string,
//         socketIds:[number],
//         ids:[number]
//     }
// }

rooms = {};
sockets = {};


let roomNumber = 0;
const createNewRoom = () => {
  roomNumber += 1;
  if (roomNumber > 100) {
    roomNumber = 0;
  }
  if (rooms[roomNumber]) {
    return createNewRoom();
  }
  return roomNumber;
}

const makeId = () => {
  const id = Math.floor(Math.random() * 1000);
  if (websockets[roomNumber].ids.includes(id)) {
    return makeId()
  }
  return id;
}

const makeSocketId = () => {
  const id = Math.floor(Math.random() * 1000);
  if (id in sockets) {
    return makeSocketId()
  }
  return id;
}

wss.on('connection', ws => {
  const socketId = makeSocketId();
  sockets[socketId] = ws;
  ws.send(toStringMessage('CREATE_ID', {id: socketId}))
  console.log("createid", socketId)
  ws.on('close', () => {
    console.log("close", socketId)
  })
  ws.on('message', message => {
    const msg = toObjectMessage(message);
    const id = msg.data.id
    if (!id) {
      return;
    }
    const socket = sockets[id];
    console.log(msg.type, msg.data);
    switch (msg.type) {
      case 'CREATE_ROOM':
        const roomNumber = createNewRoom()
        rooms[roomNumber] = {
          title: msg.data.title,
          ids: [],
          member: 1,
        };
        rooms[roomNumber].ids.push(id);
        socket.send(toStringMessage("CREATE_ROOM", {roomNumber}));
        break;
      case 'JOIN_ROOM':
        const joinRoomNumber = msg.data.roomNumber;
        rooms[joinRoomNumber].ids.forEach((memberId) => {
          sockets[memberId].send(toStringMessage("INIT_CONNECTION", {id: id}))
        })
        rooms[joinRoomNumber].ids.push(id);
        socket.send(toStringMessage('JOIN_ROOM', {roomNumber: joinRoomNumber}))
        break;
      case 'GET_ROOMS':
        const getRoomsRooms = [];
        for (let roomsKey in rooms) {
          getRoomsRooms.push({
            roomNumber: roomsKey,
            title: rooms[roomsKey].title,
            member: rooms[roomsKey].member
          },)
        }
        socket.send(toStringMessage('GET_ROOMS', {rooms: getRoomsRooms}))
        break;
      case 'CREATE_OFFER':
        sockets[msg.data.toId].send(toStringMessage('CREATE_ANSWER', {fromId: id, sdp: msg.data.sdp}));
        break;
      case 'CREATE_ANSWER':
        sockets[msg.data.toId].send(toStringMessage('GET_ANSWER', {fromId: id, sdp: msg.data.sdp}));
        break;
      default:
        break;
    }

  })

})
//
// const io = require("socket.io")(server, {cors: {origin: "*"}});
// const hostname = "127.0.0.1";
// const port = 8001;
//
// server.listen(port, hostname, () => {
//     console.log(`Server running `);
// });
