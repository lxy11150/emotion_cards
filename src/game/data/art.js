import battleStage from "../../assets/art/battle-stage-v2.png";
import attackCard from "../../assets/art/card-attack-v1.png";
import defenseCard from "../../assets/art/card-defense-v1.png";
import joyCard from "../../assets/art/card-joy-v1.png";
import guideSpirit from "../../assets/art/guide-spirit-v2.png";
import heroPlayer from "../../assets/art/hero-player-v2.png";
import mapKingdom from "../../assets/art/map-kingdom.png";
import monsterAngry from "../../assets/art/monster-angry.png";
import monsterBoss from "../../assets/art/monster-boss-v2.png";
import monsterDisgust from "../../assets/art/monster-disgust.png";
import monsterFear from "../../assets/art/monster-fear.png";
import monsterSad from "../../assets/art/monster-sad.png";
import monsterSurprise from "../../assets/art/monster-surprise.png";
import story01 from "../../assets/art/story-01.png";
import story02 from "../../assets/art/story-02.png";
import story03 from "../../assets/art/story-03.png";

export const STORY_ART = [story01, story02, story03];

export const MAP_ART = mapKingdom;

export const HERO_ART = heroPlayer;

export const GUIDE_ART = guideSpirit;

export const MONSTER_ART = {
  sad: monsterSad,
  angry: monsterAngry,
  fear: monsterFear,
  surprise: monsterSurprise,
  disgust: monsterDisgust,
  boss: monsterBoss,
};

export const BATTLE_ART = {
  backdrop: battleStage,
};

export const CARD_ART = {
  attack: attackCard,
  defense: defenseCard,
  joy: joyCard,
  sad: monsterSad,
  angry: monsterAngry,
  fear: monsterFear,
  surprise: monsterSurprise,
  disgust: monsterDisgust,
  boss: monsterBoss,
};
