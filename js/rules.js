// rules.js
// Blackjack scoring logic

// ------- Exports -------
export function cardValue(card) {
    if (["J", "Q", "K"].includes(card.value)) return 10;
    if (card.value === "A") return 11;
    return Number(card.value);
}

// ------- Calculate Score -------
export function calculateScore(hand) {
    let total = 0;
    let aces = 0;

    hand.forEach(card => {
        total += cardValue(card);
        if (card.value === "A") aces++;
    });

    // Convert Aces from 11 to 1 if needed
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    // ------- Return the final score -------
    return total;
}