const mongoose = require("mongoose");

const playerChipLogSchema = new mongoose.Schema({
    nick: {
        type: String,
        trim: true,
        required: true,
    },
    when: {
        type: String,
        default: new Date(Date.now()).toDateString(),
    },
    chips: {
        type: Number,
    }
})

const playerChipLog = mongoose.model("playerChipLog", playerChipLogSchema, "playerChipLogs");
module.exports = playerChipLog;