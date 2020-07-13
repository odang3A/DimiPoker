const express = require("express");
const playerAuthModel = require("../../models/player/playerAuth");
const playerStatsModel = require("../../models/player/playerStats");
const gameLogModel = require("../../models/game/gameLog");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const showSignupPage = (req, res) => {
    res.render("player/signup");
}

const showLoginPage = (req, res) => {
    res.render("player/login");
}

const showAccountPage = (req, res) => {
    res.render("player/account");
}

const signup = (req, res) => {
    const { id, nick, passwd } = req.body;
    if(!id || !nick || !passwd) return res.status(400).send("필수 입력값이 입력되지 않았습니다.");

    if(nick.includes('/', '?', '&')){
        return res.status(400).send("닉네임에 /, ?, & 은 사용할 수 없습니다");
    }
    
    playerAuthModel.findOne({$or: [{ id },{ nick }]}, (err, player) => {
        if(err) return res.status(500).send("사용자 조회 오류 발생");
        if(player) return res.status(409).send("이미 사용중인 Id, Nickname입니다");

        const saltRounds = 10;
        bcrypt.hash(passwd, saltRounds, (err, hash) => {
            if(err) res.status(500).send("암호화 오류 발생");
            const newPlayer = playerAuthModel({ id, nick, passwd: hash });
            newPlayer.save((err, pAuth) => {
                if(err) return res.status(500).send("회원가입 오류 발생");
                const { _id } = pAuth;
                const newStats = playerStatsModel({ _id, nick, chipLogWhen: [new Date(Date.now()).toDateString()], chipLogChips: [1000] });
                newStats.save((err, pStats) => {
                    if(err) return res.status(500).send("전적 생성 오류 발생");

                    res.status(201).send(pAuth);
                });
            })
        })
    })
}

const edit = (req, res) => {
    const { nick, newNick } = req.body;

    playerAuthModel.findOne({ nick: newNick }, (err, player) => {
        if(err) res.status(500).send("플레이어 조회 오류");
        if(player && nick != newNick) return res.status(409).send("이미 사용중인 닉네임입니다");

        playerAuthModel.findOneAndUpdate({ nick }, { nick: newNick }, (err, currPlayer) => {
            if(err) res.status(500).send("플레이어 업데이트 오류");
            playerStatsModel.findByIdAndUpdate(currPlayer._id, { nick: newNick }, (err, result) => {
                if(err) res.status(500).send("플레이어 업데이트 오류");
                
                res.json(player);
            });
        })
        
    })
}

const signout = (req, res) => {
    const { nick, passwd } = req.body;
    if( !nick || !passwd ) return res.status(400).send("비밀번호를 입력하지 않았습니다.");

    playerAuthModel.findOne({ nick }, (err, player) => {
        if(err) return res.status(500).send("사용자 조회 오류 발생");

        bcrypt.compare(passwd, player.passwd, (err, isMatch) => {
            if(err) return res.status(500).send("로그인 서버 오류");
            if(!isMatch) return res.status(500).send("비밀번호가 일치하지 않습니다.");

            playerAuthModel.findByIdAndDelete(player._id, (err, result) => {});
            playerStatsModel.findByIdAndDelete(player._id, (err, result) => {});

            res.clearCookie("token");
            res.json(player);
        })
    })
}

const checkId = (req, res) => {
    const id = req.params.id;
    console.log(id);
    playerAuthModel.findOne({ id }, (err, result) => {
        if(err) return res.status(500).send("check-id err");
        if(result) res.send(false);
        else res.send(true);
    });
}
const checkNick = (req, res) => {
    const nick = req.params.nick;
    playerAuthModel.findOne({ nick }, (err, result) => {
        if(err) return res.status(500).send("check-nick err");
        if(result) res.send(false);
        else res.send(true);
    });
}

const login = (req, res) => {
    const { id, passwd } = req.body;
    if(!id || !passwd) return res.status(400).send("필수 입력값이 입력되지 않았습니다.");

    playerAuthModel.findOne({ id }, (err, player) => {
        if(err) return res.status(500).send("로그인 서버 오류");
        if(!player) return res.status(404).send("Id 또는 비밀번호가 일치하지 않습니다.");

        bcrypt.compare(passwd, player.passwd, (err, isMatch) => {
            if(err) return res.status(500).send("로그인 서버 오류");
            if(!isMatch) return res.status(500).send("Id 또는 비밀번호가 일치하지 않습니다.");

            const token = jwt.sign(player._id.toHexString(), "1234");

            playerAuthModel.findByIdAndUpdate(player._id, { token }, { new: true }, (err, result) => {
                if(err) return res.status(500).send("로그인 서버 오류");

                res.cookie("token", token, { httpOnly: true });
                res.json(result);
            });
        });
    });
}

const checkAuth = (req, res, next) => {
    res.locals.player = null;

    const token = req.cookies.token;

    if(!token) {
        if(req.url !== "/api/player/account") {
            return next();
        } else {
            return res.render("player/login");
        }
    }

    jwt.verify(token, "1234", (err, _id) => {
        if(err) {
            res.clearCookie("token");
            return res.render("player/login");
        }
        playerAuthModel.findOne({ _id, token }, (err, player) => {
            if(err) return res.status(500).send("인증 시 오류가 발생했습니다.");
            if(!player) {
                res.clearCookie("token");
                return res.render("player/login");
            }
            res.locals.player = { id: player.id ,nick: player.nick };
            next();
        })
    })
}

const logout = (req, res) => {
    const token = req.cookies.token;

    jwt.verify(token, "1234", (err, _id) => {
        if(err) return res.status(500).send("로그아웃 시 오류가 발생했습니다");
        playerAuthModel.findByIdAndUpdate(_id, { token: "" }, (err, result) => {
            if(err) return res.status(500).send("로그아웃 시 오류가 발생했습니다.");
            res.clearCookie("token");
            res.redirect("/");
        })
    })
}

const showStats = (req, res) => {
    const nick = req.query.nick;

    var result = null;

    if(!nick) return res.status(400).render("player/stats", { result });
    playerStatsModel.findOne({ nick }, (err, stats) => {
        if(err) return res.status(500).send("사용자 조회 오류");
        //if(!result) return res.status(404).send("일치하는 플레이어가 없습니다.");
        
        result = stats;
        if(result){
            gameLogModel.find({ _id: { $in: stats.playedGameLogId }}, (err, gLogs) => {
                if(err) res.status(500).send("전적 게임 id 조회 오류");
                result.playedGameLog = gLogs;
                res.render("player/stats", { result });
            });
        } else res.render("player/stats", { result });
    })
}

const getChipLog = (req, res) => {
    const nick = req.query.nick;

    playerStatsModel.findOne({ nick }, (err, result) => {
        if(err) return res.status(500).send("칩 로그 조회 오류");
        const chartSet = {
            type: 'line',
            data: {
            labels: Array.from(result.chipLogWhen, d => onlyDayMonth(d)),
            datasets: [
                {
                label: "Chips",
                data: result.chipLogChips,
                backgroundColor: [
                    'rgba(200, 99, 132, .7)',
                ],
                borderColor: [
                    'rgba(200, 99, 132, .7)',
                ],
                borderWidth: 2
                },
            ]
            },
            options: {
            responsive: true
            }
        };
        res.json(chartSet);
    });
}

const onlyDayMonth = (d) => {
    arr = d.split(" ");
    return `${arr[2]} ${arr[1]}`;
}

const nowPlaying = (req, res) => {
    playerAuthModel.find({playing: 1}, (err, result) => {
        if(err) return res.status(500).send("접속중인 플레이어 조회 오류");
        res.json(result);
    })
}

module.exports = { showSignupPage, showLoginPage, signup, checkId, checkNick, login, checkAuth, logout, showStats, getChipLog, nowPlaying, showAccountPage, signout, edit };