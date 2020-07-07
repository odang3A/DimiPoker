const { Router } = require("express");
const router = Router();

router.use("/player", require("./player"));
router.use("/rankings", require("./rankings"));
router.use("/download", require("./download"));

module.exports = router;