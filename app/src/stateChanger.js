///@ts-check
import {Subject} from "rxjs"
import {cloneDeep} from "lodash"

/**
 * @typedef VuagileState
 * @property {VuagilePlayer[]} players
 * @property {VuagilePlayerCard[]} playerCards
 * @property {VuagileTopic} topic
 * 
 * @typedef VuagilePlayer
 * @property {string} authName
 * @property {string} firstName
 * @property {string} lastName
 * @property {boolean} hasPickedCard
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
            players: [
                {
                    authName: "pearse.hutson",
                    firstName: "Pearse",
                    lastName: "Hutson",
                    hasPickedCard: false
                },
                {
                    authName: "stephen.brink",
                    firstName: "Stephen",
                    lastName: "Brink",
                    hasPickedCard: true
                }
            ],
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
}

