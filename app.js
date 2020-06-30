const express = require("express");
const app = express();
const server = require("http").createServer(express);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
require('dotenv').config();

const uri = "mongodb+srv://node-server:node1234@cluster0.siyfo.gcp.mongodb.net/test?retryWrites=true&w=majority";

//mongoose.connect("mongodb://localhost:27017/test", {
mongoose.connect(uri, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
    console.log("Database connected!!");
})

const gamePORT = process.env.GAME_PORT;
const webPORT = process.env.WEB_PORT;

server.listen(gamePORT, () => {
    console.log(`game socket listening at http://localhost:${gamePORT}`);
});

app.listen(webPORT, () => {
    console.log(`app listening at http://localhost:${webPORT}`);
});

io.use(require("./gameSocketIO"));

