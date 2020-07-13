const { Router } = require("express");
const router = Router();
const ctrl = require("./player.ctrl");

router.get("/signup", ctrl.showSignupPage);
router.get("/check-id/:id", ctrl.checkId);
router.get("/check-nick/:nick", ctrl.checkNick);
router.get("/login", ctrl.showLoginPage);
router.get("/logout", ctrl.logout);
router.get("/", ctrl.showStats);
router.get("/chipLog", ctrl.getChipLog);
router.get("/nowPlaying", ctrl.nowPlaying);
router.get("/account", ctrl.showAccountPage);

router.post("/signup", ctrl.signup);
router.post("/login", ctrl.login);

router.put("/account/edit", ctrl.edit)

router.delete("/account/signout", ctrl.signout);

module.exports = router;