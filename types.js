//@ts-check

/**
 * @typedef Room
 * @property {String} name
 * @property {String} id
 * @property {Player[]} players
 * @property {Topic} currentTopic
 * @property {Boolean} showCards
 * 
 * @typedef Player
 * @property {String} name
 * @property {String} id
 * @property {String} socketId
 * 
 * @typedef {Player} PointingPlayer
 * @property {Card} selectedCard
 * 
 * @typedef {Player} WatchingPlayer
 * @property {String} NotARealProp
 * 
 * @typedef Card
 * @property {String} value 
 * 
 * @typedef Topic
 * @property {String} title
 * @property {Card[]} pickedCards
 */