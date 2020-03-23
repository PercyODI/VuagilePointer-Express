///@ts-check
import $ from "jquery"
import io from "socket.io-client"
// import Two from "two.js";
import "./styles.css"
import anime from "animejs"

const appSettings = {
    hostUrl: process.env.NODE_ENV == "production"
        ? "https://vuagile-pointer.herokuapp.com"
        : "http://localhost:3000"
}

$(function () {
    renderPlayArea();
})

// $(function(){
//     alert("It worked! or did it?");
// })

let socket = io.connect(appSettings.hostUrl);
socket.on("news", function (data) {
    console.dir(data)
})

function renderPlayArea() {
    let workingArea = $("#workingArea");
    workingArea.children().remove();
    renderPlayerCards();
}

function renderPlayerCards() {
    let cardVals = ["1", "2", "3", "5", "8", "13", "21", "??", "Too-Complex"];
    let cardElems = [];
    let bodyHeight = $("body").height();
    let bodyWidth = $("body").width();
    for (let cardIndex in cardVals) {
        let cardElem = $(`<div class="player-card" id="player-card-${cardVals[cardIndex]}">${cardVals[cardIndex]}</div>`);
        cardElem.css({ top: bodyHeight, left: (bodyWidth / 2) });
        cardElems.push(cardElem);
    }

    let workingArea = $("#workingArea");
    workingArea.append(cardElems);
    anime({
        targets: cardElems.map(x => x[0]),
        top: function(el, i, l) {
            let base = bodyHeight - cardElems[0].height() - 100;
            let mod = (Math.abs(i - (l / 2)))
            console.log(`base: ${base}, mod: ${mod}`)
            return base + (mod * 10);
        },
        left: anime.stagger([
            50,
            bodyWidth - cardElems[0].width() - 50]),
        delay: anime.stagger(100)
    });
}