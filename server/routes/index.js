const router = require('express').Router();
const controller = require('./controller');

router.get("/", controller.rootView);

router.get("/rooms", controller.roomsView);

router.get("/main", controller.mainView);

module.exports = router;
