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

// app.listen(port, () => console.log(`Listening on port ${port}\nLink: http://localhost:${port}`))

// socket.io Routes
io.on("connection", function(socket) {
    socket.emit("news", {hello: true})
});