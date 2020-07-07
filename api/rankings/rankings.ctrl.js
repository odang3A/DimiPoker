const express = require("express");
const playerStatsModel = require("../../models/player/playerStats");

const showRankingsPage = (req, res) => {
    const switchField = { "chips": "tokens", "earned-chips": "tokensEarned", "playtime": "playTime",
                        "game-wins": "gameWinCnt", "played-games": "gamePlayCnt", "game-winrate": "gameWinrate", 
                        "round-wins": "roundWinCnt", "played-rounds": "roundPlayCnt", "round-winrate": "roundWinrate", "level": "level" }
    const switchTh = { "chips": "Chips", "earned-chips": "Earned Chips", "playtime": "Playtime",
                        "game-wins": "Game Wins", "played-games": "Played Games", "game-winrate": "Game Winrate (%)", 
                        "round-wins": "Round Wins", "played-rounds": "Played Rounds", "round-winrate": "Round Winrate (%)", "level": "Level" }
    const field = switchField[(req.query.field || "chips")] || "tokens";
    const th = switchTh[(req.query.field || "chips")] || "Chips";

    playerStatsModel.find((err, statsArr) => {
        if(err) return res.status(500).send("랭킹 조회 오류");

        if(statsArr){
            const result = statsArr.map( s => { 
                return new Object({ nick: s.nick, field: s[field] });
            }).sort((a, b) => {
                if(a.field < b.field) return 1;
                if(a.field > b.field) return -1;
                return 0;
            });

            res.render("rankings/chipRankings", { result, th });
        }
    });
}



module.exports = { showRankingsPage };