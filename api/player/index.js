const { Router } = require("express");
const router = Router();
const ctrl = require("./player.ctrl");

router.get("/signup", ctrl.showSignupPage);
router.get("/check-id/:id", ctrl.checkId);
router.get("/check-nick/:nick", ctrl.checkNick);
router.get("/login", ctrl.showLoginPage);
router.get("/logout", ctrl.logout);
router.get("/:nick", ctrl.showStats);
router.get("/:nick/chipLog", ctrl.getChipLog);

router.post("/signup", ctrl.signup);
router.post("/login", ctrl.login);

module.exports = router;