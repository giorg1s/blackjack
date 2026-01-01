// storage.js
// Handles persistent statistics via localStorage

// ------- Exports -------
export function loadStats() {
    return {
        balance: Number(localStorage.getItem("balance")) || 500,
        wins: Number(localStorage.getItem("wins")) || 0,
        losses: Number(localStorage.getItem("losses")) || 0
    };
}

// ------- Save Stats -------
export function saveStats(balance, wins, losses) {
    localStorage.setItem("balance", balance);
    localStorage.setItem("wins", wins);
    localStorage.setItem("losses", losses);
}