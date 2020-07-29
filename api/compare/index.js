const { Router } = require("express");
const { get } = require("mongoose");
const router = Router();
const ctrl = require("./compare.ctrl");

router.get("/", ctrl.showComparePage);
router.get("/:nick", ctrl.searchCompare);

module.exports = router;