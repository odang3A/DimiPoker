const express = require("express");
const playerAuthModel = require("../../models/playerAuth");
const playerStatsModel = require("../../models/playerStats");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const playerAuth = require("../../models/playerAuth");

const showSignupPage = (req, res) => {
    res.render("player/signup");
}

const showLoginPage = (req, res) => {
    res.render("player/login");
}

const signup = (req, res) => {
    const { id, nick, passwd } = req.body;
    if(!id || !nick || !passwd) return res.status(400).send("필수 입력값이 입력되지 않았습니다.");
    
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
                const newStats = playerStatsModel({ _id, nick });
                newStats.save((err, pStats) => {
                    if(err) return res.status(500).send("전적 생성 오류 발생");

                    res.status(201).send(pAuth);
                })
            })
        })
    })
}

const checkId = (req, res) => {
    const { id } = req.body;
    playerAuthModel.findOne({ id }, (err, result) => {
        if(err) return res.status(500).send("check-id err");
        if(result) res.send(false);
        else res.send(true);
    });
}
const checkNick = (req, res) => {
    const { nick } = req.body;
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

            playerAuthModel.findByIdAndUpdate(player._id, { token }, (err, result) => {
                if(err) return res.status(500).send("로그인 서버 오류");

                res.cookie("token", token, { httpOnly: true });
                res.json(result);
            });
        });
    });
}

module.exports = { showSignupPage, showLoginPage, signup, checkId, checkNick, login };