import { BOSS_STORM_COOLDOWN, EMOTIONS, INTRO_TIP, MONSTERS, STORY_SLIDES } from "./data/content.js";
import { drawCards, freshDeckDraw, restoreCardCosts } from "./utils/deck.js";

export function normalizeGameState(save) {
  if (!save) return save;

  const level = Number.isFinite(save.level)
    ? Math.min(Math.max(save.level, 0), MONSTERS.length - 1)
    : 0;

  return {
    ...save,
    screen: save.screen || "battle",
    storyIndex: Number.isFinite(save.storyIndex) ? save.storyIndex : 0,
    level,
    levelStartHp: Number.isFinite(save.levelStartHp) ? save.levelStartHp : save.playerHp,
    deck: Array.isArray(save.deck) ? restoreCardCosts(save.deck) : [],
    discard: Array.isArray(save.discard) ? restoreCardCosts(save.discard) : [],
    hand: Array.isArray(save.hand) ? save.hand : [],
    exhausted: Array.isArray(save.exhausted) ? restoreCardCosts(save.exhausted) : [],
    debuffs: Array.isArray(save.debuffs) ? save.debuffs : [],
    bossCooldown: Number.isFinite(save.bossCooldown) ? save.bossCooldown : 0,
    guidedEmotion: save.guidedEmotion || null,
    guidedHistory: Array.isArray(save.guidedHistory) ? save.guidedHistory : [],
    clearedLevels: Array.isArray(save.clearedLevels) ? save.clearedLevels : [],
  };
}

export function monsterIntent(monster, turn, playerDebuffs, bossCooldown) {
  if (monster.boss) {
    if (turn === 1 || (playerDebuffs.length === 0 && bossCooldown <= 0)) {
      return { type: "debuffAll", label: "情绪风暴", detail: "施加所有负面情绪" };
    }

    const roll = Math.random();
    if (roll < 0.42) return { type: "attack", attack: monster.atk, label: `攻击 ${monster.atk}` };
    if (roll < 0.72) return { type: "shield", shield: monster.shield, label: `护盾 ${monster.shield}` };
    return { type: "attackShield", attack: 6, shield: 5, label: "攻击 6 + 护盾 5" };
  }

  const roll = Math.random();
  if (!playerDebuffs.includes(monster.emotion) && roll < 0.28) {
    return { type: "debuff", emotion: monster.emotion, label: `施加${EMOTIONS[monster.emotion].name}` };
  }
  if (roll < 0.7) return { type: "attack", attack: monster.atk, label: `攻击 ${monster.atk}` };
  return { type: "shield", shield: monster.shield, label: `护盾 ${monster.shield}` };
}

export function emotionTip(key) {
  const emotion = EMOTIONS[key];
  return {
    title: `${emotion.name}来了`,
    emotion: key,
    text: `${emotion.gameImpact} ${emotion.realRisk} ${emotion.instruction}`,
  };
}

export function cureTip(card) {
  const emotion = EMOTIONS[card.target];
  return {
    title: `${card.name}帮忙了`,
    emotion: card.target,
    text: `${emotion.afterCure} ${emotion.practice}`,
  };
}

export function allDebuffTip() {
  return {
    title: "情绪风暴",
    text: "好多情绪一起出现了。先看身上的情绪标记，再用对应能力卡一张一张整理。",
  };
}

export function freshRun() {
  const drawn = freshDeckDraw();
  const monster = MONSTERS[0];

  return {
    screen: "story",
    storyIndex: 0,
    playerHp: 50,
    levelStartHp: 50,
    maxHp: 50,
    level: 0,
    clearedLevels: [],
    monsterHp: monster.hp,
    monsterShield: 0,
    playerShield: 0,
    energy: 3,
    turn: 1,
    deck: drawn.deck,
    discard: drawn.discard,
    hand: drawn.hand,
    exhausted: [],
    debuffs: [],
    joy: false,
    bossCooldown: 0,
    intent: monsterIntent(monster, 1, [], 0),
    tip: INTRO_TIP,
    log: ["情绪王国正在等待小勇士。"],
    ended: false,
    guidedEmotion: null,
    guidedHistory: [],
  };
}

export function resetBattleState(state, level = state.level) {
  const monster = MONSTERS[level];
  const drawn = freshDeckDraw();

  state.screen = "battle";
  state.level = level;
  state.monsterHp = monster.hp;
  state.monsterShield = 0;
  state.playerShield = 0;
  state.energy = 3;
  state.turn = 1;
  state.deck = drawn.deck;
  state.discard = drawn.discard;
  state.hand = drawn.hand;
  state.exhausted = [];
  state.debuffs = [];
  state.joy = false;
  state.guidedEmotion = null;
  state.bossCooldown = monster.boss ? 0 : state.bossCooldown;
  state.intent = monsterIntent(monster, 1, [], monster.boss ? 0 : state.bossCooldown);
  state.tip = INTRO_TIP;
  state.log = [`开始挑战${monster.name}。`, ...state.log].slice(0, 5);
  state.ended = false;
}

export function advanceLevel(state, addLog) {
  if (state.level >= MONSTERS.length - 1) {
    state.ended = true;
    state.screen = "victory";
    state.tip = {
      title: "通关啦",
      text: "你认识了好多情绪，也学会了照顾自己。情绪王国重新亮起来啦！",
    };
    addLog(state, "打败乱乱大王，通关成功！");
    return;
  }

  const cleared = state.level;
  state.clearedLevels = Array.from(new Set([...state.clearedLevels, cleared]));
  state.level += 1;
  state.levelStartHp = state.playerHp;
  state.monsterShield = 0;
  state.playerShield = 0;
  state.energy = 3;
  state.turn = 1;
  state.debuffs = [];
  state.joy = false;
  state.guidedEmotion = null;
  state.screen = "map";
  state.deck = [];
  state.discard = [];
  state.hand = [];
  state.exhausted = [];
  state.tip = {
    title: "道路亮起来了",
    text: `${MONSTERS[state.level].name}所在的地点出现了。先看看地图，再准备挑战。`,
  };
  addLog(state, `通往${MONSTERS[state.level].name}的路打开了。`);
}

export function nextStorySlide(state) {
  if (state.storyIndex >= STORY_SLIDES.length - 1) {
    state.screen = "map";
    state.tip = { title: "地图开启", text: "选择发光的地点，去帮助情绪王国的居民吧。" };
    return;
  }

  state.storyIndex += 1;
}

export function skipToMap(state) {
  state.screen = "map";
  state.storyIndex = STORY_SLIDES.length - 1;
  state.tip = { title: "地图开启", text: "选择发光的地点，开始挑战。" };
}

export function redrawForTurnEnd(state) {
  const drawn = drawCards(state.deck, state.discard, state.hand, 6, {
    confuse: state.debuffs.includes("surprise"),
  });
  state.deck = drawn.deck;
  state.discard = drawn.discard;
  state.hand = drawn.hand;
}

export { BOSS_STORM_COOLDOWN };
