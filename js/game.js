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
    activeHand = 0;
    state = STATES.PLAYER;
    setStatus("Good luck!");
    renderHands(playerHands[0], dealerHand);
}

// ------- Hit Functionality -------
function hit() {
    if (state !== STATES.PLAYER) return;
    playerHands[activeHand].push(deck.pop());
    renderHands(playerHands[activeHand], dealerHand);
    if (calculateScore(playerHands[activeHand]) > 21) nextHandOrDealer();
}

// ------- Stand Functionality -------
function stand() {
    if (state !== STATES.PLAYER) return;
    nextHandOrDealer();
}

// ------- Double Down Functionality -------
function doubleDown() {
    if (state !== STATES.PLAYER || balance < bet) return;
    balance -= bet;
    bet *= 2;
    updateStats(balance, wins, losses, bet);
    playerHands[activeHand].push(deck.pop());
    renderHands(playerHands[activeHand], dealerHand);
    nextHandOrDealer();
}

// ------- Split Functionality -------
function split() {
    const hand = playerHands[0];
    if (state !== STATES.PLAYER || balance < bet || hand.length !== 2) return;
    if (hand[0].value !== hand[1].value) return;

    balance -= bet;
    playerHands = [[hand[0], deck.pop()], [hand[1], deck.pop()]];
    activeHand = 0;
    document.getElementById("playerCards").innerHTML = "";
    updateStats(balance, wins, losses, bet);
    renderHands(playerHands[activeHand], dealerHand);
}

// ------- Hand management -------
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

// ------- Dealer's turn -------
function dealerTurn() {
    state = STATES.DEALER;
    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
    finishGame();
}

// ------- Game conclusion -------
function finishGame() {
    const dScore = calculateScore(dealerHand);
    let msgParts = [];

    playerHands.forEach((hand) => {
        const pScore = calculateScore(hand);
        if (pScore > 21) {
            losses++;
            msgParts.push("Bust!");
        } else if (dScore > 21 || pScore > dScore) {
            balance += bet * 2;
            wins++;
            msgParts.push("Win!");
        } else if (pScore < dScore) {
            losses++;
            msgParts.push("Lost.");
        } else {
            balance += bet;
            msgParts.push("Push.");
        }
    });

    saveStats(balance, wins, losses);
    updateStats(balance, wins, losses, 0);
    state = STATES.GAME_OVER;
    renderHands(playerHands[activeHand], dealerHand, true);
    setTimeout(() => alert(msgParts.join(" ")), 500);
}

// ------- Initialization -------
function init() {
    const hitBtn = document.getElementById("hitBtn");
    const standBtn = document.getElementById("standBtn");
    const doubleBtn = document.getElementById("doubleBtn");
    const splitBtn = document.getElementById("splitBtn");
    const newGameBtn = document.getElementById("newGameBtn");

    // Create Reset Stats button
    const statsEl = document.querySelector(".stats");
    if (statsEl) {
        const resetBtn = document.createElement("button");
        resetBtn.id = "resetBtn";
        resetBtn.type = "button";
        resetBtn.textContent = "Reset Stats";
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

    // Betting buttons (including All In)
    const betGroup = document.querySelector('.bet-buttons');
    if (betGroup) {
        // add All In button dynamically
        if (!betGroup.querySelector('.allin-btn')) {
            const allInBtn = document.createElement("button");
            allInBtn.dataset.bet = "all";
            allInBtn.textContent = "All In";
            allInBtn.classList.add("allin-btn");
            allInBtn.setAttribute("type", "button");
            betGroup.appendChild(allInBtn);
        }

        betGroup.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-bet]");
            if (!btn) return;
            if (state !== STATES.BETTING) return;

            let amount;
            if (btn.dataset.bet === "all") {
                amount = balance;
            } else {
                amount = Number(btn.dataset.bet);
            }

            if (!amount || isNaN(amount) || amount <= 0) return;
            if (balance >= amount) {
                bet = amount;
                balance -= amount;
                updateStats(balance, wins, losses, bet);
                startGame();
            } else {
                setStatus("Not enough balance for that bet.");
            }

            // Active button styling
            betGroup.querySelectorAll("button").forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    }

    hitBtn && hitBtn.addEventListener('click', hit);
    standBtn && standBtn.addEventListener('click', stand);
    doubleBtn && doubleBtn.addEventListener('click', doubleDown);
    splitBtn && splitBtn.addEventListener('click', split);
    newGameBtn && newGameBtn.addEventListener('click', () => {
        state = STATES.BETTING;
        bet = 0;
        updateStats(balance, wins, losses, bet);
        setStatus("Place a new bet!");
        document.getElementById("playerCards").innerHTML = "";
        document.getElementById("dealerCards").innerHTML = "";
        // Remove active state from all bet buttons
        const allButtons = document.querySelectorAll('.bet-buttons button');
        allButtons.forEach(b => b.classList.remove('active'));
    });
}

// ------- DOM Ready -------
if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// ------- Exports -------
export {
    startGame,
    hit,
    stand,
    doubleDown,
    split
};