///@ts-check
import {Subject} from "rxjs"
import {cloneDeep} from "lodash"

/**
 * @typedef VuagileState
 * @property {string} mySocketId
 * @property {VuagilePlayer[]} players
 * @property {VuagilePlayerCard[]} playerCards
 * @property {VuagileTopic} topic
 * @property {string[]} pickedCards
 * @property {boolean} isPointing
 * 
 * @typedef VuagilePlayer
 * @property {boolean} hasPickedCard
 * @property {string} socketId
 * @property {JQuery<HTMLElement>[]} jqueryElems
 * 
 * @typedef VuagilePlayerCard
 * @property {string} val
 * @property {JQuery<HTMLElement>} jqueryElem
 * @property {boolean} hovered
 * @property {boolean} picked
 * 
 * @typedef VuagileTopic
 * @property {string} currentTopic
 * @property {string} link
 */

export class StateChanger {
    constructor() {
        /**
         * @type {VuagileState}
         */
        this.state = {
            isPointing: true,
            mySocketId: undefined,
            pickedCards: undefined,
            players: [],
            playerCards: [],
            topic: {
                currentTopic: "This is my topic!",
                link: "http://example.com"
            }
        };
        /**
         * @private
         */
        this.incomingChange = new Subject();

        /**
         * @type {Subject<VuagileState>}
         */
        this.changeNotification = new Subject();

        this.incomingChange.subscribe(changeFunction => {
            let newState = cloneDeep(this.state);
            changeFunction(newState);
            this.state = newState;
            this.changeNotification.next(this.state);
        })
    }

    /**
     * @param {function(VuagileState): void} changeFunction
     */
    addChange(changeFunction) {
        this.incomingChange.next(changeFunction)
    }

    triggerUpdate() {
        this.changeNotification.next(this.state);
    }
}

