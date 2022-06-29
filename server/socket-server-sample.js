const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});
const hostname = '127.0.0.1';
const port = 8080;

let users = {};
let socketToRoom = {};
const maximum = 2;

app.get('/', function (req, res) {
  res.send('Hello World');
});

io.on("connection", socket => {
// 1:1 에서는 이런 식으로 구현하지 않아도 되지만 글쓴이는 1:N을 먼저 구현해서 이 형태로 남겨뒀습니다.
// email 부분은 무시하셔도 무방합니다.
  socket.on("join_room", data => {
    console.log("called join_room")
// user[room]에는 room에 있는 사용자들이 배열 형태로 저장된다.
    if (users[data.room]) {
      console.log("room이 존재한다면");
      const length = users[data.room].length;
      if (length === maximum) {
        console.log("최대 인원을 충족시켰으면 더 이상 접속 불가");
        socket.to(socket.id).emit("room_full");
        return;
      }
      console.log("인원이 최대 인원보다 적으면 접속 가능");
      users[data.room].push({id: socket.id, email: data.email});
    } else {
      console.log("room이 존재하지 않는다면 새로 생성");
      users[data.room] = [{id: socket.id, email: data.email}];
      console.log("user", users)
    }
// 해당 소켓이 어느 room에 속해있는 지 알기 위해 저장
    socketToRoom[socket.id] = data.room;

    socket.join(data.room);
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} enter`);

// 본인을 제외한 같은 room의 user array
    const usersInThisRoom = users[data.room].filter(
      user => user.id !== socket.id
    );
    console.log(usersInThisRoom);


// 본인에게 해당 user array를 전송
// 새로 접속하는 user가 이미 방에 있는 user들에게 offer(signal)를 보내기 위해
    console.log("emit all_users")
    io.sockets.to(socket.id).emit("all_users", usersInThisRoom);
  });

// 다른 user들에게 offer를 보냄 (자신의 RTCSessionDescription)
  socket.on("offer", sdp => {
    console.log("offer: " + socket.id);
// room에는 두 명 밖에 없으므로 broadcast 사용해서 전달
// 여러 명 있는 처리는 다음 포스트 1:N에서...
    socket.broadcast.to(socketToRoom[socket.id]).emit("getOffer", sdp);
  });

// offer를 보낸 user에게 answer을 보냄 (자신의 RTCSessionDescription)
  socket.on("answer", sdp => {
    console.log("answer: " + socket.id);
// room에는 두 명 밖에 없으므로 broadcast 사용해서 전달
// 여러 명 있는 처리는 다음 포스트 1:N에서...
    socket.broadcast.to(socketToRoom[socket.id]).emit("getAnswer", sdp);
  });

// user가 연결이 끊겼을 때 처리
  socket.on("disconnect", () => {
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
// disconnect한 user가 포함된 roomID
    const roomID = socketToRoom[socket.id];
// room에 포함된 유저
    let room = users[roomID];
// room이 존재한다면(user들이 포함된)
    if (room) {
// disconnect user를 제외
      room = room.filter(user => user.id !== socket.id);
      users[roomID] = room;
    }
// 어떤 user가 나갔는 지 room의 다른 user들에게 통보
    socket.broadcast.to(room).emit("user_exit", {id: socket.id});
    console.log(users);
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running `)
})
