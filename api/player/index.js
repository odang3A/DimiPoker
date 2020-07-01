const { Router } = require("express");
const router = Router();
const ctrl = require("./player.ctrl");

router.get("/signup", ctrl.showSignupPage);
router.get("/login", ctrl.showLoginPage);

router.post("/signup", ctrl.signup);
router.post("/check-id", ctrl.checkId);
router.post("/check-nick", ctrl.checkNick);
router.post("/login", ctrl.login);

module.exports = router;