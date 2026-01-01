// deck.js
// Creates and shuffles a standard 52-card deck using Fisher–Yates

// ------- Exports -------
export const suits = ["♠", "♥", "♦", "♣"];
export const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

// ------- Create and Shuffle Deck -------
export function createDeck() {
    const deck = [];

    suits.forEach(suit => {
        values.forEach(value => {
        deck.push({ suit, value });
        });
    });

    // ------- Shuffle using Fisher–Yates -------
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // ------- Return the shuffled deck -------
    return deck;
}