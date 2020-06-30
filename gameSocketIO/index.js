const mongoose = require("mongoose");
const playerAuthModel = require("../models/playerAuth");
const playerStatsModel = require("../models/playerStats");
const gameLogModel = require("../models/gameLog");
const roundLogModel = require("../models/roundLog");

module.exports = (socket, next) => {

    console.log("connected");

    socket.emit("SendMessageByNode", { name: "Node", data:"Hello Unity!" });

    socket.on("SendMessageByUnity", (data) => {
        console.log(`[Message from Unity] ${data.name}: ${data.data}`);
        var msg = { name: "Node", data: "Hello again!" };
        socket.emit("Hello again", msg);
    });

    // playerAuth
    socket.on("SignIn", (data) => {
        console.log(`[SignIn] ${data.id} : ${data.passwd}`);

        playerAuthModel.findOne({ id: data.id }, (err, result) => {
            if(err) console.log("signIn err");
            else if(!result) {
                console.log("no such id");
                socket.emit("SignIn", { data: null });
            }
            else {
                if(data.passwd == result.passwd) {
                    console.log("success!");
                    socket.emit("SignIn", { data: result.nick });
                }
                else {
                    console.log("wrong passwd");
                    socket.emit("SignIn", { data: null });
                }
            }

        });
    });

    socket.on("Register", (data) => {
        console.log(`[Register] ${data.id} : ${data.nick} : ${data.passwd}`);

        playerAuthModel.findOne({$or: [{id: data.id},{nick: data.nick}]},
            (err, result) => {
                if(err) console.log("register err");
                else if(result) console.log("id/nickname already exists");
                else {
                    const { id,  nick, passwd } = data;

                    playerAuthModel.create({ id, nick, passwd }, (err, result) => {
                        if(err) console.log("register err");
                        else {
                            console.log("seccess: " + result);
                            socket.emit("Register", { data: "success" });
                            playerStatsModel.create({ "_id": result._id, "nick": nick });
                        }
                    });
                }
            }
        );
    });
    // playerAuth

    // playerStats
    socket.on("GetPlayerStats", (data) => {
        //console.log(`[Stats] ${data.nick}`);
        playerStatsModel.findOne({ nick: data.nick }, (err, result) => {
            if(err) console.log(err);
            //console.log(`result: ${result}`);
            socket.emit("GetPlayerStats", result);
        });
    });
    // playerStats

    // gamePlay
    socket.on("UpdatePlayerStats", (data) => {
        const { nick, update } = data;
        playerStatsModel.findOne({ "nick": nick },
            (err, result) => {
                if(err) console.log(`err: ${err}`);
                switch(update) {
                    case "gamePlayCnt":
                        result.gamePlayCnt++;
                        break;
                    case "gameWinCnt":
                        result.gameWinCnt++;
                        break;
                    case "roundPlayCnt":
                        result.roundPlayCnt++;
                        break;
                    case "roundWinCnt": 
                        result.roundWinCnt++;
                        break;
                    default:
                        if(!Number.isNaN(update)){
                            result.tokens += Number(update);
                            if(Number(update) > 0){
                                result.roundWinCnt++;
                            }
                        }
                        break;
                }
                result.gameWLRatio = result.gameWinCnt
                    / (result.gamePlayCnt == result.gameWinCnt
                        ? 1 : (result.gamePlayCnt - result.gameWinCnt));
                result.roundWLRatio = result.roundWinCnt
                    / (result.roundPlayCnt == result.roundWinCnt
                        ? 1: (result.roundPlayCnt - result.roundWinCnt));
                playerStatsModel.findOneAndUpdate(
                    { "nick": nick },
                    result,
                    { new: true },
                    (err, r) => {
                        if(err) console.log("stats err: " + err);
                        //console.log(`stats ${r}`);
                    }
                );
            }
        );
    });

    socket.on("UpdatePlayTime", (data) => {
        const { nick, playTime } = data;
        playerStatsModel.findOneAndUpdate(
            { "nick": nick },
            { $set: { "playTime": playTime },},
            { new: true },
            (err, result) => {
                if(err) console.log("updatePlayTime err");
                // console.log(result);
                socket.emit("updateCurrPlayerInfo", result);
            });
    });

    // gameLog
    socket.on("gameStartLog", (data) => {
        gameLogModel.create(data, (err, result) => {
            if(err) console.log(err);
            socket.emit("gameStartLog", result);
        });
    });

    socket.on("gameEndLog", (data) => {
        const { gameId, gameWinner } = data;
        gameLogModel.findByIdAndUpdate(
            gameId,
            {$set: {"gameWinner": gameWinner}, },
            {new: true}, 
            (err, result) => {
                if(err) console.log(err);
                //console.log(`[gameLog] ${result}`);
            }
        );
    });
    // gameLog

    // roundLog
    socket.on("roundStartLog", (data) => {
        roundLogModel.create(data, (err, result) => {
            if(err) console.log(err);
            //게임 총 라운드 수 업데이트
            gameLogModel.findByIdAndUpdate(
                result.gameId,
                {$set: {"roundCnt": result.roundNum},},
                {new: true},
                (err, r) => {
                    // console.log(r.roundCnt); 
                }
            );
            socket.emit("roundStartLog", result);
        });
    });

    socket.on("roundEndLog", (data) => {
        //console.log(`[roundEnd] ${data}`);
        const { roundId, roundWinner, roundPrise } = data;
        roundLogModel.findByIdAndUpdate(
            roundId,
            { $set: {
                "roundWinner": roundWinner, 
                "roundPrise": roundPrise
            },},
            {new: true},
            (err, result) => {
                if(err) console.log(err);
                //console.log(`[roundLog] ${result}`);
            }
        );
    });
    
    next();
}