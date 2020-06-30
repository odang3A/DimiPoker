const express = require("express");
const app = express();
const server = require("http").createServer(express);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
require('dotenv').config();

var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const uri = process.env.DB_URL;

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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.render("index");
});
//라우팅 모듈 설정
app.use("/api", require("./api"));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err: {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});