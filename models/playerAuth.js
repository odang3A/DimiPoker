const mongoose = require("mongoose");

const playerAuthSchema = new mongoose.Schema({
    id: {
        type: String,
        trim: true,
        required: true,
    },
    nick: {
        type: String,
        trim: true,
        required: true,
    },
    passwd: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
});

const playerAuth = mongoose.model("playerAuth", playerAuthSchema, "playerAuths");
module.exports = playerAuth;