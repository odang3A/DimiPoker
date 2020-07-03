const { Router } = require("express");
const router = Router();

router.use("/player", require("./player"));
router.use("/account", require("./account"));

module.exports = router;