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
app.post("/api/forceReset", (req, res) => {
    for (const player of players) {
        player.pickedCard = null;
        player.hasPickedCard = false;
    }
    allowPickingCards = true;
    io.emit("resetPlay");
    res.json("Done.")
})

// app.listen(port, () => console.log(`Listening on port ${port}\nLink: http://localhost:${port}`))
let players = []
let allowPickingCards = true;
let allowedCards = ["1", "2", "3", "5", "8", "21", "??", "Too-Complex"];

// socket.io Routes
io.on("connection", function (socket) {
    socket.emit("updateSocketId", socket.id)
    players.push({
        socketId: socket.id,
        hasPickedCard: false,
        pickedCard: null,
        isPointing: true
    });
    io.emit("updatePlayers", players.filter(p => p.isPointing).map(userToEmit));

    socket.on("pickedCard", function (cardPicked) {
        if (allowPickingCards) {
            let foundPlayer = players.find(p => p.socketId == socket.id)
            if (cardPicked != null) {
                foundPlayer.pickedCard = cardPicked;
                foundPlayer.hasPickedCard = true;
            } else {
                foundPlayer.pickedCard = null;
                foundPlayer.hasPickedCard = false;
            }
            io.emit("updatePlayers", players.filter(p => p.isPointing).map(userToEmit));

            console.log("all Picked Card? " + players.filter(p => p.isPointing && !p.hasPickedCard).length)
            if (players.filter(p => p.isPointing && !p.hasPickedCard).length == 0) {
                io.emit("showCards", players.filter(p => p.hasPickedCard && allowedCards.findIndex(ac => p.pickedCard == ac) != -1).map(p => p.pickedCard))
                allowPickingCards = false;
            }
        }
    })
    socket.on("reset", function () {
        for (const player of players) {
            player.pickedCard = null;
            player.hasPickedCard = false;
        }
        allowPickingCards = true;
        io.emit("resetPlay");
    })

    socket.on("notPointing", function () {
        let foundPlayer = players.find(p => p.socketId == socket.id);
        foundPlayer.isPointing = false;
        foundPlayer.hasPickedCard = false;
        foundPlayer.pickedCard = null;
        io.emit("updatePlayers", players.filter(p => p.isPointing).map(userToEmit));

        console.log("all Picked Card? " + players.filter(p => p.isPointing && !p.hasPickedCard).length)
        if (players.filter(p => p.isPointing && !p.hasPickedCard).length == 0) {
            io.emit("showCards", players.filter(p => p.hasPickedCard).map(p => p.pickedCard))
        }
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