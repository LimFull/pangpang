const router = require('express').Router();
const controller = require('./controller');

router.get("/", controller.rootView);

router.get("/main", controller.mainView);

module.exports = router;
