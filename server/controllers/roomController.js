//@ts-check
const Database = require("../db")

/**
 * @param {import("express").Express} app
 */
exports.applyRoutes = function(app) {
    app.get("/api/rooms", async (req, res) => {
        let rooms = await Database.getAllRooms()
        res.json(rooms.map(convertToCondensedRoom));
    });

    app.get("/api/rooms/:roomId", async (req, res) => {
        res.json(convertToFullRoom(await Database.getRoomById(req.params.roomId)))
    })

    
}

/**
 * @param {Room} room
 */
function convertToCondensedRoom(room){
    return {
        id: room.id,
        name: room.name
    }
}

/**
 * @param {Room} room
 */
function convertToFullRoom(room){
    return {
        name: room.name,
        id: room.id,
        players: room.players,
        currentTopic: room.currentTopic,
        showCards: room.showCards
    }
}