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

$(function () {
  let workingArea = $("#workingArea");
  workingArea.children().remove();
  // gsap.ticker.add(() => renderPlayArea(stateChanger.state))
  // createDelayedCall();
  stateChanger.changeNotification.subscribe(renderPlayArea);
  stateChanger.changeNotification.subscribe(d => console.log(d));
  $(window).resize(() => stateChanger.triggerUpdate());
  createPlayerCards();
})

let socket = io.connect(appSettings.hostUrl);
socket.on("updatePlayers", /**
     * @param {import("./stateChanger").VuagilePlayer[]} incomingPlayers
     */
  function (incomingPlayers) {
    console.log("Receving Player Update:")
    console.dir(incomingPlayers)
    stateChanger.addChange(s => {
      for (const player of incomingPlayers.filter(ip => ip.socketId != s.mySocketId)) {
        var existingPlayer = s.players.find(p => p.socketId == player.socketId);
        if (existingPlayer == undefined) {
          s.players.push(player);
          createOtherPlayer(player);
        } else {
          var epIndex = s.players.indexOf(existingPlayer);
          s.players.splice(epIndex, 1, { ...existingPlayer, ...player })
        }
      }
      for (const statePlayer of s.players) {
        if (incomingPlayers.find(ip => ip.socketId == statePlayer.socketId) == undefined) {
          if (statePlayer.jqueryElems != undefined) {
            for (const jqueryElem of statePlayer.jqueryElems) {
              jqueryElem.remove();
            }
          }
          s.players = s.players.filter(sp => sp.socketId != statePlayer.socketId);
        }
      }
    })
  })
socket.on("updateSocketId", (socketId) => stateChanger.addChange(s => s.mySocketId = socketId))
socket.on("showCards", (pickedCardVals) => {
  renderShownCards(pickedCardVals);
  console.log("Showing Cards")
  stateChanger.addChange(s => s.pickedCards = pickedCardVals);
});
socket.on("resetPlay", () => {
  stateChanger.addChange(s => {
    s.pickedCards = undefined;
    s.playerCards = s.playerCards.map(pc => ({ ...pc, picked: false }))
    s.players = s.players.map(p => ({ ...p, hasPickedCard: false }))
  })
});

/**
 * @param {import("./stateChanger").VuagileState} [state]
 */
function renderPlayArea(state) {
  let body = $("body");
  let bodyHeight = body.height();
  let bodyWidth = body.width();
  let workingArea = $("#workingArea");

  let playerCardsNotPicked = _.filter(state.playerCards, pc => !pc.picked);
  let startingPoint = bodyWidth * 0.15;
  let endingPoint = bodyWidth - (bodyWidth * 0.15);
  let spread = (endingPoint - startingPoint) / playerCardsNotPicked.length;

  let scale = bodyWidth / 750;
  let cardHeight = 100 * scale;
  let cardWidth = 75 * scale;
  for (let i = 0; i < state.playerCards.length; i++) {
    let playerCardProps = {
      scale: scale
    };
    let playerCard = state.playerCards[i];

    if (!playerCard.picked && !playerCard.hovered) {
      playerCardProps = {
        ...playerCardProps,
        top: bodyHeight - cardHeight,
        left: spread * playerCardsNotPicked.indexOf(playerCard) + startingPoint
      };
      gsap.set(playerCard.jqueryElem, { zIndex: i })
    }

    if (!playerCard.picked && playerCard.hovered) {
      playerCardProps = {
        ...playerCardProps,
        top: bodyHeight - (cardHeight * 1.1)
      }
      gsap.set(playerCard.jqueryElem, { zIndex: state.playerCards.length })
    }

    if (playerCard.picked) {
      if (state.pickedCards == undefined) {
        playerCardProps = {
          ...playerCardProps,
          duration: .3,
          top: (bodyHeight - (cardHeight * 2.1)),
          left: (bodyWidth / 2) - (cardWidth / 2)
        }
      } else {
        playerCardProps = {
          ...playerCardProps,
          duration: .5,
          top: 0 - cardHeight,
          left: (bodyWidth / 2) - (cardWidth / 2)
        }
      }
    }
    gsap.to(playerCard.jqueryElem, {
      duration: .2,
      ...playerCardProps
    })
  }

  // Render Other Players
  let otherPlayersList = state.players.filter(p => p.socketId != state.mySocketId);
  for (let i = 0; i < otherPlayersList.length; i++) {
    let player = otherPlayersList[i];
    // if (player.jqueryElems == undefined || player.jqueryElems == null) {
    //   createOtherPlayer(player);
    // }


    for (let j = 0; j < player.jqueryElems.length; j++) {
      let card = player.jqueryElems[j];
      let otherPlayerCardProps = {};


      let startingTop = 50;
      let endingTop = bodyHeight - (cardHeight * 1.2)
      let topSpread = (endingTop - startingTop) / otherPlayersList.length;
      otherPlayerCardProps = {
        ...otherPlayerCardProps,
        top: startingTop + (topSpread * i)
      }

      if (i % 2 == 0) {
        otherPlayerCardProps = {
          ...otherPlayerCardProps,
          left: startingPoint + (j * 20)
        }
      } else {
        otherPlayerCardProps = {
          ...otherPlayerCardProps,
          left: endingPoint - (j * 20)
        }
      }

      console.log("Has Other Player Picked Card? " + player.hasPickedCard)
      if (player.hasPickedCard && j == player.jqueryElems.length - 1) {
        if (i % 2 == 0) {
          otherPlayerCardProps = {
            ...otherPlayerCardProps,
            left: (startingPoint + (j * 20)) + 50
          }
        } else {
          otherPlayerCardProps = {
            ...otherPlayerCardProps,
            left: (endingPoint - (j * 20)) - 50
          }
        }

        if (state.pickedCards != undefined) {

          otherPlayerCardProps = {
            ...otherPlayerCardProps,
            top: -100
          }
        }
      }

      gsap.to(card, {
        duration: .2,
        ...otherPlayerCardProps
      });
    }
  }

  // Render Picked Cards
  if (state.pickedCards != undefined) {
    gsap.to("#reset-btn", { opacity: 1, duration: 1 })
    gsap.to(".player-card.shownCards", {
      duration: 1,
      top: function(i) {
        return (Math.floor(i / 5) * cardHeight) + startingPoint
      },
      left: function(i) {
        return ((i % 5) * cardWidth) + startingPoint + cardWidth
      },
      scale: scale
    })

  } else {
    gsap.to("#reset-btn", { opacity: 0, duration: 1 })
    gsap.to(".player-card.shownCards", {
      duration: 1,
      top: -cardHeight - 50,
      left: (bodyWidth / 2) - (cardWidth / 2)
    })
  }
  //
}

/**
 * @param {import("./stateChanger").VuagilePlayer} player
 */
function createOtherPlayer(player) {
  player.jqueryElems = [];

  let workingArea = $("#workingArea");
  let body = $("body");
  let bodyWidth = body.width();
  for (let i = 0; i < 3; i++) {
    let cardElem = $(/*html*/
      `
        <div class="other-player-card card"></div>
      `);
    cardElem.width(37.5);
    cardElem.height(50);
    cardElem.css({ top: -50, left: (bodyWidth / 2) - 18.75 })
    workingArea.append(cardElem);

    player.jqueryElems.push(cardElem)
  }
}

function createPlayerCards() {
  let workingArea = $("#workingArea");
  let cardVals = ["1", "2", "3", "5", "8", "13", "21", "??", "Too-Complex"];
  let body = $("body");
  let bodyHeight = body.height();
  let bodyWidth = body.width();

  for (let cardIndex in cardVals) {
    let cardVal = cardVals[cardIndex];
    let cardElem = $(/*html*/
      `
                <div class="player-card card" id="player-card-${cardVal}">
                    <span class="player-card-span">${cardVal}</span>
                </div>
            `);
    cardElem.css({ top: bodyHeight, left: bodyWidth / 2 });
    cardElem.width(75)
    cardElem.height(100);
    workingArea.append(cardElem);

    while (cardElem.width() - 10 < cardElem.find(".player-card-span").width()) {
      cardElem.css("font-size", (parseFloat(cardElem.css("font-size")) - 1))
    }

    cardElem.mouseenter(() => stateChanger.addChange(s => _.find(s.playerCards, pc => pc.val == cardVal).hovered = true))
    cardElem.mouseleave(() => stateChanger.addChange(s => _.find(s.playerCards, pc => pc.val == cardVal).hovered = false))
    cardElem.click(
      () => {
        stateChanger.addChange(s => {
          let foundCard = _.find(s.playerCards, pc => pc.val == cardVal);
          if (foundCard.picked) {
            s.playerCards.forEach(pc => pc.picked = false)
            socket.emit("pickedCard", null)
          }
          else {
            foundCard.picked = true;
            _.filter(s.playerCards, pc => pc.val != cardVal).forEach(pc => pc.picked = false)
            socket.emit("pickedCard", cardVal)
          }
        })
      }
    )

    stateChanger.addChange(s => s.playerCards.push({
      val: cardVals[cardIndex],
      jqueryElem: cardElem,
      hovered: false,
      picked: false
    }))
  }

}

function renderShownCards(pickedCardVals){
  $(".shownCards").remove();

  let workingArea = $(`#workingArea`);
  let body = $("body");
  let bodyHeight = body.height();
  let bodyWidth = body.width();

  let resetBtn = $(`<button id="reset-btn" class="shownCards">Reset</button>`)
  resetBtn.click(() => {
    socket.emit("reset");
  })
  resetBtn.css({ position: "absolute", top: 5, left: 20, opacity: 0 });
  workingArea.append(resetBtn);

  for(let i = 0; i < pickedCardVals.length; i++){
    var cardVal = pickedCardVals[i];
    
    let cardElem = $(/*html*/
      `
                <div class="player-card card shownCards" id="player-card-${cardVal}">
                    <span class="player-card-span">${cardVal}</span>
                </div>
            `);
    cardElem.css({ top: 0 - 100, left: (bodyWidth / 2) - (75 / 2) });
    cardElem.width(75)
    cardElem.height(100);
    workingArea.append(cardElem);

    while (cardElem.width() - 10 < cardElem.find(".player-card-span").width()) {
      cardElem.css("font-size", (parseFloat(cardElem.css("font-size")) - 1))
    }
  }
}