///@ts-check
const socketEvents = require("./socketEvents")
const express = require("express")
const app = express()
const port = process.env.PORT

// socket.io things
var server = new (require("http").Server)(app);
var io = require("socket.io")(server);

// controllers
let RoomController = require("./controllers/roomController")

server.listen(port, () => console.log(`Listening on port ${port}\nLink: http://localhost:${port}`))

// Express Routes
app.use("/app", express.static("app/dist"));
app.get("/", (req, res) => res.redirect("/app/index.html"))

// Controlled Express Routes
RoomController.applyRoutes(app);


// app.get("/api/users", (req, res) => res.json(appData.KnownUsers))
// app.post("/api/forceShowCards", (req, res) => {
//     io.emit("showCards", players.filter(p => p.hasPickedCard).map(p => p.pickedCard));
//     res.json("Done.")
// });
// app.post("/api/forceReset", (req, res) => {
//     for (const player of players) {
//         player.pickedCard = null;
//         player.hasPickedCard = false;
//     }
//     allowPickingCards = true;
//     io.emit("resetPlay");
//     res.json("Done.")
// })

io.on("connection", socket => socketEvents.configEvents(socket, io));

