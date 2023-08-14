const express = require("express");

const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1

app.get("/players/", async (request, response) => {
  const getAllPlayerQuery = `
        SELECT
         player_id As playerId,
         player_name AS playerName 
        FROM
          player_details;`;

  const playerArray = await database.all(getAllPlayerQuery);
  response.send(playerArray);
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `
        SELECT
         player_id As playerId,
         player_name AS playerName 
        FROM
            player_details
        WHERE
         player_id = ${playerId};`;

  const player = await database.get(getPlayerQuery);
  response.send(player);
});

//API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerDetails = request.body;

  const { playerName } = playerDetails;

  const updatedPlayerQuery = `
            UPDATE

            player_details

            SET 
            player_name= "${playerName}"

            WHERE 
            player_id = ${playerId};`;

  await database.run(updatedPlayerQuery);
  response.send("Player Details Updated");
});

//API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const getMatchQuery = `
        SELECT
         match_id As matchId,

         match,

         year  

        FROM
            match_details
        WHERE
        match_id = ${matchId};`;

  const match = await database.get(getMatchQuery);
  response.send(match);
});

//API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerMatchQuery = `
        SELECT
         match_id As matchId,

         match,

         year  

        FROM
            Player_match_score NATURAL JOIN match_details

        WHERE
         player_id = ${playerId};`;

  const playerMatchArray = await database.all(getPlayerMatchQuery);
  response.send(playerMatchArray);
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const getMatchPlayerQuery = `
        SELECT
          player_match_score.player_id AS playerId,

          player_name AS playerName
         
        FROM
           player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score .player_id

        WHERE

         match_id = ${matchId};`;

  const matchPlayerArray = await database.all(getMatchPlayerQuery);
  response.send(matchPlayerArray);
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerScoreQuery = `
SELECT 
      player_details.player_id AS playerId,
      player_details.player_name AS playerName,
      SUM(player_match_score.score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes

FROM 
     player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score .player_id


WHERE 
   player_details.player_id = ${playerId};`;

  const playerScore = await database.get(getPlayerScoreQuery);
  response.send(playerScore);
});

module.exports = app;
