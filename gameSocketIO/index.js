const mongoose = require("mongoose");
const playerAuthModel = require("../models/player/playerAuth");
const playerStatsModel = require("../models/player/playerStats");
const playerChipLogModel = require("../models/player/playerChipLog");
const gameLogModel = require("../models/game/gameLog");
const roundLogModel = require("../models/game/roundLog");
const bcrypt = require("bcrypt");
const playerAuth = require("../models/player/playerAuth");

module.exports = (socket, next) => {

    console.log("connected");

    socket.emit("CheckVersion", { version: "2.0.0" });

    // playerAuth
    socket.on("SignIn", (data) => {
        console.log(`[SignIn] ${data.id} : ${data.passwd}`);

        playerAuthModel.findOne({ id: data.id }, (err, result) => {
            if(err) return console.log("signIn err");
            else if(!result) {
                //console.log("no such id");
                socket.emit("SignIn", { isAble: false, mess: "Incorrect Id or PW" });
            }
            else {
                bcrypt.compare(data.passwd, result.passwd, (err, isMatch) => {
                    if(err) return console.log(err);

                    else if(isMatch) {
                        //console.log("success!");
                        if(result.playing != 0){ //if playing
                            socket.emit("SignIn", { isAble: false, mess: "Player is already playing" });
                        } else {
                            playerAuthModel.findByIdAndUpdate(result._id, { playing: 1 }, (err) => {
                                if(err) return console.log("playing err");
                                socket.emit("SignIn", { isAble: true, mess: result.nick });
                            })
                        }
                    }
                    else {
                        //console.log("wrong passwd");
                        socket.emit("SignIn", { isAble: false, mess: "Incorrect Id or PW" });
                    }
                });
            }
        });
    });

    socket.on("SignOut", (data) => {
        const nick = data.nick;
        console.log(nick);
        playerAuthModel.findOneAndUpdate({ nick }, { playing: 0 }, (err) => {
            if(err) return console.log("signout err");
            console.log(result);
        })
    })

    socket.on("Register", (data) => {
        console.log(`[Register] ${data.id} : ${data.nick} : ${data.passwd}`);

        playerAuthModel.findOne({$or: [{id: data.id},{nick: data.nick}]}, (err, result) => {
            if(err) return console.log("register err");
            else if(result) socket.emit("Register", { isAble: false, mess: "Can't use Id or Nick" });
            else {
                const { id,  nick, passwd } = data;
                const saltRounds = 10;

                bcrypt.hash(passwd, saltRounds, (err, hash) => {
                    if(err) return console.log(err);

                    const newPlayer = playerAuthModel({ id, nick, passwd: hash });
                    newPlayer.save((err, player) => {
                        if(err) return console.log("register err");
                        else {
                            //console.log("seccess: " + player);
                            socket.emit("Register", { isAble: true, mess: "Success" });
                            playerStatsModel.create({ "_id": player._id, "nick": nick });
                            playerChipLogModel.create({ nick, chips: 1000 });
                        }
                    });
                });
            }
        });
    });
    // playerAuth

    // playerStats
    socket.on("GetPlayerStats", (data) => {
        //console.log(`[Stats] ${data.nick}`);
        playerStatsModel.findOne({ nick: data.nick }, (err, result) => {
            if(err) return console.log(err);
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
                if(err) return console.log(`err: ${err}`);
                switch(update) {
                    case "gamePlayCnt":
                        result.gamePlayCnt++;
                        result.exp += 1;
                        break;
                    case "gameWinCnt":
                        result.gameWinCnt++;
                        result.exp += 3;
                        break;
                    case "roundPlayCnt":
                        result.roundPlayCnt++;
                        result.exp += 1;
                        break;
                    case "roundWinCnt": 
                        result.roundWinCnt++;
                        result.exp += 2;
                        break;
                    default:
                        if(!Number.isNaN(update)){
                            result.tokens += Number(update);
                            if(Number(update) > 0){
                                result.roundWinCnt++;
                                result.exp += 2;
                                result.tokensEarned += Number(update);
                            }
                            if(Number(update) != 0) {
                                playerChipLogModel.findOne(
                                    { nick, when: new Date(Date.now()).toDateString() },
                                    { chips: result.tokens },
                                    { new: true },
                                    (err, cLogUpdated) => {
                                        if(err) return console.log("chipLog Update err");
                                        if(!cLogUpdated) {
                                            playerChipLogModel.create({ nick, chips: result.tokens }, (err, cLogCreated) => {
                                                if(err) return console.log("chipLog Create err");
                                            })
                                        }
                                    }
                                );
                            }
                        }
                        break;
                }
                for(i=10, result.level=1;result.exp-i>=0;i+=(i+5)){
                    result.level++;
                }
                result.gameWinrate = (result.gameWinCnt * 100 / result.gamePlayCnt).toFixed(2);
                result.roundWinrate = (result.roundWinCnt * 100 / result.roundPlayCnt).toFixed(2);
                playerStatsModel.findOneAndUpdate(
                    { "nick": nick },
                    result,
                    { new: true },
                    (err, r) => {
                        if(err) return console.log("stats err: " + err);
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
                if(err) return console.log("updatePlayTime err");
                // console.log(result);
                socket.emit("updateCurrPlayerInfo", result);
            });
    });

    // gameLog
    socket.on("gameStartLog", (data) => {
        gameLogModel.create(data, (err, gameLog) => {
            if(err) return console.log(err);
            socket.emit("gameStartLog", gameLog);

            for(i=1;i<=8;i++){
                if(gameLog[`p${i}`]){
                    playerStatsModel.findOneAndUpdate(
                        { nick: gameLog[`p${i}`] },
                        { $push: { playedGameLogId: gameLog._id } },
                        { new: true },
                        (err, result) => {
                            if(err) return console.log("전적 게임로그 업데이트 오류");
                        })
                } else break;
            }
        });
    });

    socket.on("gameEndLog", (data) => {
        const { gameId, gameWinner } = data;
        gameLogModel.findByIdAndUpdate(
            gameId,
            {$set: {"gameWinner": gameWinner}, },
            {new: true}, 
            (err, result) => {
                if(err) return console.log(err);
                //console.log(`[gameLog] ${result}`);
            }
        );
    });
    // gameLog

    // roundLog
    socket.on("roundStartLog", (data) => {
        roundLogModel.create(data, (err, result) => {
            if(err) return console.log(err);
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
                if(err) return console.log(err);
                //console.log(`[roundLog] ${result}`);
            }
        );
    });
    
    next();
}