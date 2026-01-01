// ui.js
// Responsible only for rendering and UI updates

// ------- Imports -------
import { calculateScore } from "./rules.js";

// ------- Create Card Element -------
function createCard(c, isNew = false) {
    const div = document.createElement("div");

    // Guard: c may be undefined for placeholders
    const suit = c && c.suit ? c.suit : "";
    const value = c && c.value ? c.value : "";
    const isRed = suit === "♥" || suit === "♦" ? "red" : "";
    div.className = `card ${isRed} ${isNew ? 'new-card' : ''}`;

    // Set visible text: show "?" for hidden placeholders
    div.textContent = value || suit ? `${value}${suit}` : "?";

    // Set data-value for CSS pseudo elements to read
    if (value || suit) div.setAttribute("data-value", `${value}${suit}`);
    return div;
}

// ------- Render Hands -------
export function renderHands(playerHand, dealerHand, showDealer = false) {
    const pContainer = document.getElementById("playerCards");
    const dContainer = document.getElementById("dealerCards");

    // Player - append only new cards (preserve animation/new-card)
    if (pContainer && playerHand) {
        if (pContainer.children.length < playerHand.length) {
            for (let i = pContainer.children.length; i < playerHand.length; i++) {
                pContainer.appendChild(createCard(playerHand[i], true));
            }
        } else {
            // If fewer children (e.g. new round), rebuild
            if (pContainer.children.length !== playerHand.length) {
                pContainer.innerHTML = "";
                playerHand.forEach((c, i) => pContainer.appendChild(createCard(c, i === playerHand.length - 1)));
            }
        }
    }

    // Dealer - show first card hidden unless showDealer true
    if (dContainer && dealerHand) {
        const prevCount = dContainer.children.length;
        dContainer.innerHTML = "";
        dealerHand.forEach((c, i) => {
            if (!showDealer && i === 0) {
                const hidden = document.createElement("div");
                hidden.className = "card";
                hidden.textContent = "?";
                dContainer.appendChild(hidden);
            } else {
                dContainer.appendChild(createCard(c, i >= prevCount));
            }
        });
    }

    // Scores
    const playerScoreEl = document.getElementById("playerScore");
    const dealerScoreEl = document.getElementById("dealerScore");
    if (playerScoreEl && playerHand) playerScoreEl.textContent = calculateScore(playerHand);
    if (dealerScoreEl) dealerScoreEl.textContent = showDealer ? calculateScore(dealerHand) : "?";
}

// ------- Update Stats -------
export function updateStats(balance, wins, losses, bet) {
    const balEl = document.getElementById("balance");
    const winsEl = document.getElementById("wins");
    const lossesEl = document.getElementById("losses");
    const betEl = document.getElementById("currentBet");

    // Update DOM elements
    if (balEl) balEl.textContent = balance;
    if (winsEl) winsEl.textContent = wins;
    if (lossesEl) lossesEl.textContent = losses;
    if (betEl) betEl.textContent = bet;
}

// ------- Set Status Message -------
export function setStatus(msg) {
    const statusEl = document.getElementById("status");
    if (statusEl) statusEl.textContent = msg;
}