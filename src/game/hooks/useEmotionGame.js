import { useEffect, useRef, useState } from "react";
import { EMOTIONS, MONSTERS, STORY_SLIDES } from "../data/content.js";
import {
  BOSS_STORM_COOLDOWN,
  advanceLevel,
  allDebuffTip,
  cureTip,
  emotionTip,
  freshRun,
  monsterIntent,
  nextStorySlide,
  normalizeGameState,
  redrawForTurnEnd,
  resetBattleState,
  skipToMap,
} from "../logic.js";
import {
  isCureForEmotion,
  keepableCardsForDebuffs,
  pullGuidedCardIntoHand,
  restoreCardCost,
  restoreCardCosts,
  startGuidedCure,
} from "../utils/deck.js";
import { clearPersisted, fetchSave, persist } from "../utils/storage.js";
import { speechTextForTip } from "../utils/text.js";
import { chooseKidFriendlyVoice } from "../utils/voice.js";

export function useEmotionGame() {
  const [game, setGame] = useState(null);
  const [saveExists, setSaveExists] = useState(false);
  const [showPile, setShowPile] = useState(null);
  const [muted, setMuted] = useState(false);
  const [voices, setVoices] = useState([]);
  const tipRef = useRef("");

  useEffect(() => {
    fetchSave().then((save) => setSaveExists(Boolean(save)));
  }, []);

  useEffect(() => {
    if (game) {
      persist(game);
    }
  }, [game]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (!game || muted) return;
    if (!("speechSynthesis" in window)) return;

    const speech =
      game.screen === "story"
        ? STORY_SLIDES[game.storyIndex]
          ? `${STORY_SLIDES[game.storyIndex].title}。${STORY_SLIDES[game.storyIndex].text}`
          : ""
        : speechTextForTip(game.tip);

    if (!speech || tipRef.current === speech) return;

    const availableVoices = voices.length ? voices : window.speechSynthesis.getVoices();
    if (!availableVoices.length) return;

    tipRef.current = speech;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speech);
    const voice = chooseKidFriendlyVoice(availableVoices);
    if (voice) utterance.voice = voice;
    utterance.lang = "zh-CN";
    utterance.rate = 1.02;
    utterance.pitch = 1.65;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, [game?.screen, game?.storyIndex, game?.tip, muted, voices]);

  const monster = game ? MONSTERS[game.level] : MONSTERS[0];

  function updateGame(updater) {
    setGame((previous) => {
      const safeState = normalizeGameState(previous);
      if (!safeState) return safeState;
      return updater(structuredClone(safeState));
    });
  }

  function addLog(state, text) {
    state.log = [text, ...state.log].slice(0, 5);
  }

  function startNew() {
    const next = freshRun();
    setGame(next);
    setSaveExists(true);
  }

  async function continueGame() {
    const save = await fetchSave();
    if (!save) return false;
    setGame(normalizeGameState(save));
    return true;
  }

  function nextStory() {
    updateGame((state) => {
      nextStorySlide(state);
      return state;
    });
  }

  function skipStory() {
    updateGame((state) => {
      skipToMap(state);
      return state;
    });
  }

  function openMonsterIntro(level = game?.level ?? 0) {
    updateGame((state) => {
      state.level = level;
      state.screen = "monsterIntro";
      state.tip = { title: MONSTERS[level].name, text: MONSTERS[level].intro };
      return state;
    });
  }

  function backToMap() {
    updateGame((state) => {
      state.screen = "map";
      return state;
    });
  }

  function startChallenge() {
    updateGame((state) => {
      resetBattleState(state, state.level);
      return state;
    });
  }

  function saveAndExit() {
    if (game) persist(game);
    setSaveExists(Boolean(game));
    setGame(null);
    setShowPile(null);
  }

  async function returnHome() {
    setGame(null);
    setShowPile(null);
    setSaveExists(false);
    await clearPersisted();
  }

  function playCard(card) {
    if (!game || game.ended || card.cost > game.energy) return;
    if (game.guidedEmotion && !isCureForEmotion(card, game.guidedEmotion)) return;
    if (card.kind === "joy" && game.debuffs.length > 0) return;

    updateGame((state) => {
      const cardIndex = state.hand.findIndex((item) => item.id === card.id);
      if (cardIndex < 0) return state;
      const playedCard = state.hand[cardIndex];

      if (playedCard.kind === "joy" && state.debuffs.length > 0) {
        state.tip = {
          title: "先整理情绪",
          text: "还有负面情绪在心里时，快乐暂时亮不起来。先用对应能力卡把情绪整理好。",
        };
        return state;
      }

      state.energy -= playedCard.cost;
      state.hand.splice(cardIndex, 1);
      state.exhausted.push(restoreCardCost(playedCard));

      if (
        !isCureForEmotion(playedCard, state.guidedEmotion) &&
        state.debuffs.includes("disgust") &&
        Math.random() < 0.5
      ) {
        addLog(state, `厌恶让「${playedCard.name}」没有成功。`);
        return state;
      }

      if (playedCard.type === "attack") {
        let damage = 6;
        if (state.joy) damage *= 2;
        if (state.debuffs.includes("sad")) damage = Math.ceil(damage / 2);
        const blocked = Math.min(state.monsterShield, damage);
        state.monsterShield -= blocked;
        state.monsterHp -= damage - blocked;
        addLog(state, `攻击造成 ${damage - blocked} 点伤害。`);
      }

      if (playedCard.type === "defense") {
        let block = 5;
        if (state.joy) block *= 2;
        if (state.debuffs.includes("fear")) block = Math.ceil(block / 2);
        state.playerShield += block;
        addLog(state, `获得 ${block} 点护甲。`);
      }

      if (playedCard.type === "ability") {
        if (playedCard.kind === "joy") {
          state.joy = true;
          state.tip = { title: "快乐亮起来", text: "快乐像小太阳。现在攻击和防御会更有力。" };
          addLog(state, "进入快乐状态。");
        } else {
          const before = state.debuffs.length;
          state.debuffs = state.debuffs.filter((item) => item !== playedCard.target);
          const removedDebuff = before !== state.debuffs.length;
          const clearedBossDebuffs = MONSTERS[state.level].boss && removedDebuff && state.debuffs.length === 0;

          if (state.guidedEmotion === playedCard.target) {
            state.guidedEmotion = null;
          }

          state.tip =
            before === state.debuffs.length
              ? { title: `${playedCard.name}准备好了`, text: `现在没有${EMOTIONS[playedCard.target].name}，这张卡先练习一下也可以。` }
              : cureTip(playedCard);

          if (clearedBossDebuffs) {
            state.bossCooldown = BOSS_STORM_COOLDOWN;
            state.tip = {
              ...state.tip,
              text: `${state.tip.text} 乱乱大王会休息两个回合后再放情绪风暴。`,
            };
          }

          addLog(state, `使用了${playedCard.name}。`);
        }
      }

      if (state.monsterHp <= 0) {
        advanceLevel(state, addLog);
      }

      return state;
    });
  }

  function endTurn() {
    if (!game || game.ended) return;

    updateGame((state) => {
      const activeMonster = MONSTERS[state.level];
      let incoming = 0;
      let newDebuff = null;

      state.monsterShield = 0;

      if (state.intent.type === "attack" || state.intent.type === "attackShield") {
        incoming = state.intent.attack;
      }
      if (state.intent.type === "shield" || state.intent.type === "attackShield") {
        state.monsterShield = state.intent.shield;
      }
      if (state.intent.type === "debuff") {
        newDebuff = state.intent.emotion;
      }
      if (state.intent.type === "debuffAll") {
        state.debuffs = Object.keys(EMOTIONS);
        state.joy = false;
        state.bossCooldown = BOSS_STORM_COOLDOWN;
        state.tip = allDebuffTip();
        addLog(state, "乱乱大王放出了情绪风暴。");
      }

      if (newDebuff && !state.debuffs.includes(newDebuff)) {
        state.debuffs.push(newDebuff);
        state.joy = false;
        state.tip = emotionTip(newDebuff);
        startGuidedCure(state, newDebuff, activeMonster);
        addLog(state, `${EMOTIONS[newDebuff].name}影响了主角。`);
      }

      if (incoming > 0) {
        const blocked = Math.min(state.playerShield, incoming);
        let damage = incoming - blocked;

        if (damage > 0 && state.debuffs.includes("angry")) {
          damage = Math.ceil(damage * 1.5);
        }

        state.playerHp -= damage;
        addLog(state, damage > 0 ? `受到了 ${damage} 点伤害。` : "完全防住了攻击！");

      }

      if (state.playerHp <= 0) {
        state.playerHp = 0;
        state.ended = true;
        state.tip = { title: "休息一下", text: "这次太累了。可以从新游戏再来，慢慢练习。" };
        addLog(state, "主角需要休息。");
        return state;
      }

      const handSplit = keepableCardsForDebuffs(state.hand, state.debuffs, activeMonster);
      state.discard.push(...restoreCardCosts(handSplit.discard), ...restoreCardCosts(state.exhausted));
      state.hand = handSplit.keep;
      state.exhausted = [];
      state.playerShield = 0;
      state.energy = 3;
      state.turn += 1;

      if (activeMonster.boss && state.bossCooldown > 0 && state.debuffs.length === 0) {
        state.bossCooldown -= 1;
      }

      redrawForTurnEnd(state);
      if (state.guidedEmotion) {
        pullGuidedCardIntoHand(state, state.guidedEmotion);
      }

      state.intent = monsterIntent(activeMonster, state.turn, state.debuffs, state.bossCooldown);
      return state;
    });
  }

  function restartLevel() {
    updateGame((state) => {
      const activeMonster = MONSTERS[state.level];
      state.playerHp = Math.min(state.levelStartHp, state.maxHp);
      resetBattleState(state, state.level);
      state.tip = { title: "重新挑战", text: "回到本关开始时的血量。牌堆也重新洗好啦。" };
      state.log = [`重新挑战${activeMonster.name}。`, ...state.log].slice(0, 5);
      return state;
    });
  }

  function abandon() {
    startNew();
  }

  return {
    game,
    monster,
    saveExists,
    showPile,
    setShowPile,
    muted,
    setMuted,
    startNew,
    continueGame,
    nextStory,
    skipStory,
    openMonsterIntro,
    backToMap,
    startChallenge,
    saveAndExit,
    playCard,
    endTurn,
    restartLevel,
    abandon,
    returnHome,
    storyCount: STORY_SLIDES.length,
  };
}
