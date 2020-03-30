//@ts-check
const MongoClient = require("mongodb").MongoClient;

/**
 * @template T
 * @param {function(import("mongodb").Db): T} getQuery 
 */
async function runQuery(getQuery) {
    return new Promise((res, rej) => MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true },  async (err, databaseConn) => {
        if (err) throw err;

        let result = await getQuery(databaseConn.db());

        databaseConn.close();
        res(result);
    }));
}

/**
 * @returns {Promise<Room[]>}
 */
exports.getAllRooms = async function () {
    return await runQuery(async db =>
        await db.collection("rooms").find({}).toArray()
    );
}

/**
 * @param {String} roomId
 * @returns {Promise<Room>}
 */
exports.getRoomById = async function (roomId) {
    return new Promise((res,rej) => runQuery(async db =>
        res(await db.collection("rooms").findOne({id: roomId}))
    ));
}