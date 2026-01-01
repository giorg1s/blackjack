// game.js
// Main game controller (state-driven)

// ------- Imports -------
import { createDeck } from "./deck.js";
import { calculateScore } from "./rules.js";
import { renderHands, updateStats, setStatus } from "./ui.js";
import { loadStats, saveStats } from "./storage.js";

const STATES = { BETTING: "BETTING", PLAYER: "PLAYER", DEALER: "DEALER", GAME_OVER: "GAME_OVER" };
let state = STATES.BETTING;
let deck, dealerHand = [], playerHands = [], activeHand = 0, bet = 0;
let { balance, wins, losses } = loadStats();

// ------- Start Game -------
function startGame() {
    document.getElementById("playerCards").innerHTML = "";
    document.getElementById("dealerCards").innerHTML = "";
    deck = createDeck();
    dealerHand = [deck.pop(), deck.pop()];
    playerHands = [[deck.pop(), deck.pop()]];

    // Starter bet
    playerHands[0].bet = bet;

    activeHand = 0;
    state = STATES.PLAYER;
    setStatus("Good luck!");
    renderHands(playerHands[0], dealerHand);

    // clears bet for next round
    bet = 0;
    updateStats(balance, wins, losses, bet);
}

// ------- Hit -------
function hit() {
    if (state !== STATES.PLAYER) return;
    playerHands[activeHand].push(deck.pop());
    renderHands(playerHands[activeHand], dealerHand);
    if (calculateScore(playerHands[activeHand]) > 21) nextHandOrDealer();
}

// ------- Stand -------
function stand() {
    if (state !== STATES.PLAYER) return;
    nextHandOrDealer();
}

// ------- Double Down -------
function doubleDown() {
    if (state !== STATES.PLAYER || balance < bet) return;
    balance -= bet;
    playerHands[activeHand].bet = bet * 2;
    updateStats(balance, wins, losses, playerHands[activeHand].bet);
    playerHands[activeHand].push(deck.pop());
    renderHands(playerHands[activeHand], dealerHand);
    nextHandOrDealer();
}

// ------- Split -------
function split() {
    const hand = playerHands[0];
    if (state !== STATES.PLAYER || balance < bet || hand.length !== 2) return;
    if (hand[0].value !== hand[1].value) return;

    balance -= bet;
    playerHands = [
        [hand[0], deck.pop()],
        [hand[1], deck.pop()]
    ];
    playerHands[0].bet = bet;
    playerHands[1].bet = bet;

    activeHand = 0;
    document.getElementById("playerCards").innerHTML = "";
    updateStats(balance, wins, losses, bet);
    renderHands(playerHands[activeHand], dealerHand);
}

// ------- Hand flow -------
function nextHandOrDealer() {
    if (playerHands.length > 1 && activeHand === 0) {
        activeHand = 1;
        document.getElementById("playerCards").innerHTML = "";
        setStatus("Second Hand...");
        renderHands(playerHands[activeHand], dealerHand);
    } else {
        dealerTurn();
    }
}

// ------- Dealer -------
function dealerTurn() {
    state = STATES.DEALER;
    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
    finishGame();
}

// ------- Finish Game (Διορθωμένο για split & double) -------
function finishGame() {
    const dScore = calculateScore(dealerHand);
    let msgParts = [];

    playerHands.forEach((hand) => {
        const pScore = calculateScore(hand);
        const handBet = hand.bet || bet;

        if (pScore > 21) {
            losses++;
            msgParts.push("Bust!");
        } else if (dScore > 21 || pScore > dScore) {
            balance += handBet * 2;
            wins++;
            msgParts.push("Win!");
        } else if (pScore < dScore) {
            losses++;
            msgParts.push("Lost.");
        } else {
            balance += handBet;
            msgParts.push("Push.");
        }
    });

    saveStats(balance, wins, losses);
    updateStats(balance, wins, losses, 0);
    state = STATES.GAME_OVER;
    renderHands(playerHands[activeHand], dealerHand, true);

    setTimeout(() => {
        alert(msgParts.join(" "));
        autoNewRound();
    }, 500);
}

// ------- Auto New Round -------
function autoNewRound() {
    state = STATES.BETTING;
    bet = 0;

    document.getElementById("playerCards").innerHTML = "";
    document.getElementById("dealerCards").innerHTML = "";

    updateStats(balance, wins, losses, bet);
    setStatus("Place your bet!");

    document
        .querySelectorAll(".bet-buttons button")
        .forEach(b => b.classList.remove("active"));
}

// ------- Init -------
function init() {
    const hitBtn = document.getElementById("hitBtn");
    const standBtn = document.getElementById("standBtn");
    const doubleBtn = document.getElementById("doubleBtn");
    const splitBtn = document.getElementById("splitBtn");

    // Reset stats button
    const statsEl = document.querySelector(".stats");
    if (statsEl) {
        const resetBtn = document.createElement("button");
        resetBtn.textContent = "Reset Stats";
        resetBtn.type = "button";
        resetBtn.classList.add("reset-btn");
        resetBtn.addEventListener("click", () => {
            if (confirm("Reset all statistics and balance to $500?")) {
                localStorage.clear();
                location.reload();
            }
        });
        statsEl.appendChild(resetBtn);
    }

    updateStats(balance, wins, losses, bet);
    setStatus("Place your bet!");

    // Betting
    const betGroup = document.querySelector(".bet-buttons");
    if (betGroup) {
        if (!betGroup.querySelector(".allin-btn")) {
            const allInBtn = document.createElement("button");
            allInBtn.dataset.bet = "all";
            allInBtn.textContent = "All In";
            allInBtn.type = "button";
            allInBtn.classList.add("allin-btn");
            betGroup.appendChild(allInBtn);
        }

        betGroup.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-bet]");
            if (!btn || state !== STATES.BETTING) return;

            const amount = btn.dataset.bet === "all" ? balance : Number(btn.dataset.bet);
            if (!amount || balance < amount) return;

            bet = amount;
            balance -= amount;
            updateStats(balance, wins, losses, bet);
            setStatus("");
            startGame();

            betGroup.querySelectorAll("button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    }

    hitBtn && hitBtn.addEventListener("click", hit);
    standBtn && standBtn.addEventListener("click", stand);
    doubleBtn && doubleBtn.addEventListener("click", doubleDown);
    splitBtn && splitBtn.addEventListener("click", split);
}

// ------- DOM Ready -------
if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// ------- Exports -------
export { startGame, hit, stand, doubleDown, split };
