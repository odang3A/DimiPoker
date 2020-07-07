const express = require("express");

const downloadForPC = (req, res) => {
    const filePath = "gameFiles/Poker.zip"
    res.download(filePath, "Poker.zip", (err) => {
        if(err) return res.status(500).send(err);
    })
}

const downloadForAndroid = (req, res) => {
    res.send("and");
}

module.exports = { downloadForPC, downloadForAndroid };