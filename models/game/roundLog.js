const mongoose = require("mongoose");

const roundLogSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    roundNum: {
        type: Number,
        required: true,
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
    roundWinner: {
        type: String,
    },
    roundPrise: {
        type: Number,
    }
});

const roundLog = mongoose.model("roundLog", roundLogSchema, "roundLogs");
module.exports = roundLog;