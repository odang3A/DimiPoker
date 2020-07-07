const { Router } = require("express");
const router = Router();
const ctrl = require("./rankings.ctrl");

router.get("/", ctrl.showRankingsPage);

module.exports = router;