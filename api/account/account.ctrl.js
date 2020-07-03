const express  = require("express");

const showProfile = (req, res) => {
    res.render("account/profile");
}

module.exports = { showProfile };
