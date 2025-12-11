const router = require("express").Router();

const markAuthRoute = require("./marksAssement");
const markRoutes = require("./marksRoutes");

router.use("/assessment", markAuthRoute);

router.use(markRoutes);

module.exports = router;
