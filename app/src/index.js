///@ts-check
import "./styles.css"
import $ from "jquery"
import io from "socket.io-client"
import gsap from "gsap"
import { StateChanger } from "./stateChanger"
import _ from "lodash"

const appSettings = {
    hostUrl: process.env.NODE_ENV == "production"
        ? "https://vuagile-pointer.herokuapp.com"
        : "http://localhost:3000"
}
const stateChanger = new StateChanger();
// let timeline = gsap.timeline({autoRemoveChildren: true})//anime.timeline({duration: 100});
let delayedCall = undefined;

function createDelayedCall() {
    delayedCall = gsap.delayedCall(1, () => {
        renderPlayArea(stateChanger.state)
        // delayedCall.restart();
        createDelayedCall();
    })
}

$(function () {
    let workingArea = $("#workingArea");
    workingArea.children().remove();
    // gsap.ticker.add(() => renderPlayArea(stateChanger.state))
    createDelayedCall();
    stateChanger.changeNotification.subscribe(renderPlayArea);
    stateChanger.changeNotification.subscribe(d => console.log(d));

    createPlayerCards();
})

let socket = io.connect(appSettings.hostUrl);
socket.on("news", function (data) {
    console.dir(data)
})

/**
 * @param {import("./stateChanger").VuagileState} [state]
 */
function renderPlayArea(state) {
    // timeline.kill();
    // timeline = gsap.timeline();

    let body = $("body");
    let bodyHeight = body.height();
    let bodyWidth = body.width();
    let workingArea = $("#workingArea");

    for (let i = 0; i < state.playerCards.length; i++) {
        // for (const playerCard of state.playerCards) {
        let playerCard = state.playerCards[i];
        if (!playerCard.picked && !playerCard.hovered) {
            let playerCardsNotPicked = _.filter(state.playerCards, pc => !pc.picked);
            let startingPoint = bodyWidth * 0.15;
            let endingPoint = bodyWidth - (bodyWidth * 0.15);
            let spread = (endingPoint - startingPoint) / playerCardsNotPicked.length;
            gsap.to(playerCard.jqueryElem, {
                duration: .1,
                delay: .05 * i,
                top: bodyHeight - playerCard.jqueryElem.height(), 
                left: spread * i + startingPoint
            })
            // timeline.add({
            //     targets: playerCard.jqueryElem[0],
            //     top: bodyHeight - playerCard.jqueryElem.height(),
            //     left: spread * i + startingPoint
            // });
            continue;
        }

        if (!playerCard.picked && playerCard.hovered) {
            let playerCardHeight = playerCard.jqueryElem.height();
            gsap.to(playerCard.jqueryElem, { duration: .2, top: bodyHeight - (playerCardHeight * 1.1) })
            // timeline.add({
            //     targets: playerCard.jqueryElem[0],
            //     top: bodyHeight - (playerCardHeight * 1.1)
            // })
        }

    }
}

function createPlayerCards() {
    let cardVals = ["1", "2", "3", "5", "8", "13", "21", "??", "Too-Complex"];
    let cardElems = [];
    let body = $("body");
    let bodyHeight = body.height();
    let bodyWidth = body.width();

    let cardWidth = (bodyWidth - 100) / cardVals.length;
    let cardHeight = cardWidth / 0.75;
    for (let cardIndex in cardVals) {
        let cardElem = $(`<div class="player-card" id="player-card-${cardVals[cardIndex]}">${cardVals[cardIndex]}</div>`);
        cardElem.width(cardWidth);
        cardElem.height(cardHeight);
        cardElem.css({ top: bodyHeight, left: bodyWidth / 2 });
        console.log("width: " + cardElem.width());
        cardElems.push(cardElem);

        cardElem.mouseenter(() => stateChanger.addChange(s => _.find(s.playerCards, pc => pc.val == cardVals[cardIndex]).hovered = true))
        cardElem.mouseleave(() => stateChanger.addChange(s => _.find(s.playerCards, pc => pc.val == cardVals[cardIndex]).hovered = false))

        stateChanger.addChange(s => s.playerCards.push({
            val: cardVals[cardIndex],
            jqueryElem: cardElem,
            hovered: false,
            picked: false
        }))
    }
    let workingArea = $("#workingArea");
    workingArea.append(cardElems);
}

// function renderPlayerCards() {
//     anime({
//         targets: cardElems.map(x => x[0]),
//         translateY: -cardHeight,
//         translateX: anime.stagger([-(bodyWidth / 2) + cardWidth, (bodyWidth / 2) - cardWidth]),
//         // top: function(el, i, l) {
//         //     let base = bodyHeight - cardElems[0].height() - 100;
//         //     let mod = (Math.abs(i - (l / 2)))
//         //     console.log(`base: ${base}, mod: ${mod}`)
//         //     return base + (mod * 10);
//         // },
//         // left: anime.stagger([
//         //     50,
//         //     bodyWidth - cardElems[0].width() - 50]),
//         delay: anime.stagger(150)
//     });
// }