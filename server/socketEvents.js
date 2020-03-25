//@ts-check

let players = []
let allowPickingCards = true;
let allowedCards = ["1", "2", "3", "5", "8", "21", "??", "Too-Complex"];

function userToEmit(user) {
    return {
        socketId: user.socketId,
        hasPickedCard: user.hasPickedCard
    }
}

exports.configEvents = (socket, io, state) => {
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
        console.log(process.env.MONGODB_URI)
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
}