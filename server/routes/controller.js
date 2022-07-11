const root = require('../')


const resObj = (res, obj) => {
    res.end(JSON.stringify(obj));
};

exports.mainView = function (req, res) {
    resObj(res, {});
};

exports.rootView = function (req, res) {
    res.send("Hello world");
};

exports.roomsView = function (req, res) {
    const rooms = []
    const websockets = root.websockets;

    console.log(websockets)
    for (let websocketsKey in websockets) {

        const room = {
            roomNumber: websocketsKey,
            title: websockets[websocketsKey].title,
            member: websockets[websocketsKey].ids.length
        }
        rooms.push(room);
    }

    res.send({data: rooms});
};
