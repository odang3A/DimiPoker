const playerStatsModel = require("../../models/player/playerStats");

const showComparePage = (req, res) => {
    res.render("compare/compare");
}

const searchCompare = (req, res) => {
    const nick = req.params.nick;

    playerStatsModel.findOne({nick}, (err, result) => {
        if(err) return res.status(500).send("플레이어 조회 오류");
        if(!result) return res.status(404).send("존재하지 않는 플레이어입니다");

        res.json(result);
    })
}

module.exports = { showComparePage, searchCompare };