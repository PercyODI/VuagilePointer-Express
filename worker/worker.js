//@ts-check

const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);

client.on("message", function(channel, message) {
    /**
     * @type {Room} room
     */
    let room = JSON.parse(message);
});

client.subscribe("updateRoom");