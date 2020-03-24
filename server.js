///@ts-check
const appData = require("./data")
const express = require("express")
const app = express()
const port = process.env.PORT || 3000

// socket.io things
var server = new (require("http").Server)(app);
var io = require("socket.io")(server);

server.listen(port, () => console.log(`Listening on port ${port}\nLink: http://localhost:${port}`))

// Express Routes
app.use("/app", express.static("app/dist"));
app.get("/", (req, res) => res.redirect("/app/index.html"))
app.get("/api/users", (req, res) => res.json(appData.KnownUsers))
app.post("/api/forceShowCards", (req, res) => {
    io.emit("showCards", players.filter(p => p.hasPickedCard).map(p => p.pickedCard));
    res.json("Done.")
});

// app.listen(port, () => console.log(`Listening on port ${port}\nLink: http://localhost:${port}`))
let players = []

// socket.io Routes
io.on("connection", function (socket) {
    socket.emit("updateSocketId", socket.id)
    players.push({ socketId: socket.id, hasPickedCard: false });
    io.emit("updatePlayers", players.map(userToEmit));

    socket.on("pickedCard", function (cardPicked) {
        let foundPlayer = players.find(p => p.socketId == socket.id)
        if (cardPicked != null) {
            foundPlayer.pickedCard = cardPicked;
            foundPlayer.hasPickedCard = true;
        } else {
            foundPlayer.pickedCard = null;
            foundPlayer.hasPickedCard = false;
        }
        io.emit("updatePlayers", players.map(userToEmit));

        console.log("all Picked Card? " + players.filter(p => !p.hasPickedCard).length)
        if(players.filter(p => !p.hasPickedCard).length == 0){
            io.emit("showCards", players.map(p => p.pickedCard))
        }
    })

    socket.on("reset", function() {
        for (const player of players) {
            player.pickedCard = null;
            player.hasPickedCard = false;
        }
        io.emit("resetPlay");
    })

    socket.on("disconnect", function () {
        players = players.filter(p => p.socketId != socket.id);
        io.emit("updatePlayers", players.map(userToEmit));
    })
});

function userToEmit(user) {
    return {
        socketId: user.socketId,
        hasPickedCard: user.hasPickedCard
    }
}