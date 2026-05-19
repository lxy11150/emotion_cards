import { ABILITIES } from "../data/content.js";

export function shuffle(cards) {
  const copy = [...cards];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function cardBaseCost(card) {
  return Number.isFinite(card?.baseCost) ? card.baseCost : card.cost;
}

export function restoreCardCost(card) {
  const baseCost = cardBaseCost(card);
  const { confusedCost, ...cleanCard } = card;

  return { ...cleanCard, baseCost, cost: baseCost };
}

export function restoreCardCosts(cards) {
  return cards.map(restoreCardCost);
}

function withBaseCost(card) {
  return { ...card, baseCost: card.cost };
}

function confuseDrawnCard(card) {
  const cleanCard = restoreCardCost(card);
  return { ...cleanCard, cost: Math.floor(Math.random() * 4), confusedCost: true };
}

export function baseDeck() {
  let id = 0;
  const cards = [];

  for (let index = 0; index < 7; index += 1) {
    cards.push(withBaseCost({ id: `atk-${id++}`, type: "attack", name: "攻击", pinyin: "gong ji", cost: 1 }));
  }

  for (let index = 0; index < 7; index += 1) {
    cards.push(withBaseCost({ id: `def-${id++}`, type: "defense", name: "防御", pinyin: "fang yu", cost: 1 }));
  }

  Object.entries(ABILITIES).forEach(([abilityKey, ability]) => {
    cards.push(withBaseCost({ id: `${abilityKey}-${id++}`, type: "ability", ability: abilityKey, ...ability }));
  });

  return shuffle(cards);
}

export function drawCards(deck, discard, hand = [], target = 6, options = {}) {
  let draw = restoreCardCosts(deck);
  let pile = restoreCardCosts(discard);
  const nextHand = [...hand];

  while (nextHand.length < target) {
    if (draw.length === 0) {
      if (pile.length === 0) break;
      draw = shuffle(pile);
      pile = [];
    }

    const drawnCard = draw.shift();
    nextHand.push(options.confuse ? confuseDrawnCard(drawnCard) : drawnCard);
  }

  return { deck: draw, discard: pile, hand: nextHand };
}

export function freshDeckDraw() {
  return drawCards(baseDeck(), [], []);
}

export function cureAbilityForEmotion(emotion) {
  return Object.entries(ABILITIES).find(([, ability]) => ability.target === emotion)?.[0] || null;
}

export function isCureForEmotion(card, emotion) {
  return Boolean(emotion && card?.type === "ability" && card.target === emotion);
}

export function keepableCardsForDebuffs(cards, debuffs, monster) {
  if (monster.boss) {
    return { keep: [], discard: restoreCardCosts(cards) };
  }

  const keep = [];
  const discard = [];

  cards.forEach((card) => {
    if (isCureForEmotion(card, card.target) && debuffs.includes(card.target)) {
      keep.push(card);
    } else {
      discard.push(restoreCardCost(card));
    }
  });

  return { keep, discard };
}

export function pullGuidedCardIntoHand(state, emotion) {
  const abilityKey = cureAbilityForEmotion(emotion);
  if (!abilityKey || state.hand.some((card) => card.ability === abilityKey)) return;

  const piles = ["deck", "discard", "exhausted"];
  for (const pile of piles) {
    const index = state[pile].findIndex((card) => card.ability === abilityKey);
    if (index < 0) continue;

    const [card] = state[pile].splice(index, 1);
    if (state.hand.length >= 6) {
      const replaceIndex = state.hand.findIndex((item) => !isCureForEmotion(item, emotion));
      const [replaced] = state.hand.splice(replaceIndex >= 0 ? replaceIndex : state.hand.length - 1, 1);
      state.deck.push(restoreCardCost(replaced));
    }

    state.hand.push(card);
    return;
  }
}

export function startGuidedCure(state, emotion, monster) {
  if (monster.boss || state.guidedHistory.includes(emotion)) return;
  state.guidedEmotion = emotion;
  state.guidedHistory.push(emotion);
}
