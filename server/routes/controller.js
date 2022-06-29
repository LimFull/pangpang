let rooms = {};

const resObj =(res, obj)=> {
  res.end(JSON.stringify(obj));
}

exports.mainView = function (req, res) {
  resObj(res, rooms);
}

exports.rootView = function (req, res) {
  console.log("root");
  res.send("Hello world");
}
