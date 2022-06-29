let rooms = {};

const resObj =(res, obj)=> {
  res.end(JSON.stringify(obj));
}

exports.mainView = function (req, res) {
  resObj(res, rooms);
}

exports.rootView = function (req, res) {
  res.end("Hello world");
}
