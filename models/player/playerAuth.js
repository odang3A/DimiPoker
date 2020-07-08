const mongoose = require("mongoose");

const playerAuthSchema = new mongoose.Schema({
    id: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    nick: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    passwd: {
        type: String,
        required: true,
    },
    token: {
        type: String,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    playing: {
        type: Number,
        default: 0,
    },
});

const playerAuth = mongoose.model("playerAuth", playerAuthSchema, "playerAuths");
module.exports = playerAuth;