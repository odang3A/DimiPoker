const { Router } = require("express");
const router = Router();
const ctrl = require("./download.ctrl");

router.get("/pc", ctrl.downloadForPC);
router.get("/android", ctrl.downloadForAndroid);

module.exports = router;