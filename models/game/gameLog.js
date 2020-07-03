const mongoose = require("mongoose");

const gameLogSchema = new mongoose.Schema({
    startTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    gameWinner: {
        type: String,
    },
    p1: String,
    p2: String,
    p3: String,
    p4: String,
    p5: String,
    p6: String,
    p7: String,
    p8: String,
    playerCnt: {
        type: Number,
        required: true,
    },
    roundCnt: Number,
});

const gameLog = mongoose.model("gameLog", gameLogSchema, "gameLogs");
module.exports = gameLog;