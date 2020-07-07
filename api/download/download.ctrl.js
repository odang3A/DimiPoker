const express = require("express");

const downloadForPC = (req, res) => {
    const filePath = "gameFiles/Poker.zip"
    res.download(filePath, "Poker.zip", (err) => {
        if(err) {
            if(!res.headersSent) {
                return res.status(500).send();
            }
        }
    })
}

const downloadForAndroid = (req, res) => {
    const filePath = "gameFiles/PokerApp.zip"
    res.download(filePath, "PokerApp.zip", (err) => {
        if(err) {
            if(!res.headersSent) {
                return res.status(500).send();
            }
        }
    })
}

module.exports = { downloadForPC, downloadForAndroid };