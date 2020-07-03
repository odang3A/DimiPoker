const { Router}  = require("express");
const router = Router();
const ctrl = require("./account.ctrl");

router.get("/profile", ctrl.showProfile);

module.exports = router;