const express = require("express");

const downloadForPC = (req, res) => {
    const filePath = "gameFiles/Poker.zip"
    res.download(filePath, "Poker.zip", (err) => {
        if(err) return res.status(500).send(err);
    })
}

const downloadForAndroid = (req, res) => {
    const filePath = "gameFiles/PokerApp.zip"
    res.download(filePath, "PokerApp.zip", (err) => {
        if(err) return res.status(500).send(err);
    })
}

module.exports = { downloadForPC, downloadForAndroid };