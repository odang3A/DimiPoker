const mongoose = require("mongoose");

const playerStatsSchema = new mongoose.Schema({
    nick: {
        type: String,
        trim: true,
        required: true,
    },
    playTime: {
        type: String,
        default: 0,
    },
    tokens: {
        type: Number,
        default: 1000,
    },
    gamePlayCnt: {
        type: Number,
        default: 0,
    },
    gameWinCnt: {
        type: Number,
        default: 0,
    },
    gameWLRatio: Number,
    roundPlayCnt: {
        type: Number,
        default: 0,
    },
    roundWinCnt: {
        type: Number,
        default: 0,
    },
    roundWLRatio: Number,
})

const playerStats = mongoose.model("playerStats", playerStatsSchema, "playerStats");
module.exports = playerStats;