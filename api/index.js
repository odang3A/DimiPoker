const { Router} = require("express");
const router = Router();

router.use("/player", require("./player"));

module.exports = router;