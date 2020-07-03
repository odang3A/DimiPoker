const mongoose = require("mongoose");

const playerStatsSchema = new mongoose.Schema({
    nick: {
        type: String,
        trim: true,
        required: true,
    },
    level: {
        type: Number,
        default: 1,
    },
    exp: {
        type: Number,
        default: 0,
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
    gameWinrate: {
        type: Number,
        default: 0,
    },
    roundPlayCnt: {
        type: Number,
        default: 0,
    },
    roundWinCnt: {
        type: Number,
        default: 0,
    },
    roundWinrate: {
        type: Number,
        default: 0,
    }
})

const playerStats = mongoose.model("playerStats", playerStatsSchema, "playerStats");
module.exports = playerStats;