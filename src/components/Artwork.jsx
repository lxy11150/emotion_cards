import { BATTLE_ART, GUIDE_ART, HERO_ART, MAP_ART, MONSTER_ART, STORY_ART } from "../game/data/art.js";

export function StoryArtwork({ index, title }) {
  const image = STORY_ART[index];

  if (image) {
    return <img className="scene-image" src={image} alt={title} />;
  }

  return (
    <div className="scene-fallback">
      <div className="scene-fallback-sun" />
      <div className="scene-fallback-hills" />
      <HeroArt />
    </div>
  );
}

export function MapArtwork() {
  if (MAP_ART) {
    return <img className="map-image" src={MAP_ART} alt="情绪王国路线图" />;
  }

  return (
    <div className="map-fallback">
      <div className="map-fallback-castle" />
      <div className="map-fallback-river" />
      <div className="map-fallback-forest" />
    </div>
  );
}

export function BattleBackdrop() {
  if (BATTLE_ART.backdrop) {
    return <img className="battle-backdrop-image" src={BATTLE_ART.backdrop} alt="" aria-hidden="true" />;
  }

  return (
    <>
      <div className="battle-backdrop-sky" />
      <div className="battle-backdrop-mountains" />
      <div className="battle-backdrop-ground" />
      <div className="battle-backdrop-stars" />
    </>
  );
}

export function GuideSprite({ mood }) {
  if (GUIDE_ART) {
    return (
      <div className={`guide-illustration ${mood || "steady"}`}>
        <img src={GUIDE_ART} alt="情绪小精灵" />
      </div>
    );
  }

  return (
    <div className={`sprite ${mood}`}>
      <div className="wing left" />
      <div className="wing right" />
      <div className="face">
        <i />
        <i />
        <span />
      </div>
    </div>
  );
}

export function HeroArt({ large }) {
  if (HERO_ART) {
    return (
      <div className={`hero-illustration ${large ? "large" : ""}`}>
        <img src={HERO_ART} alt="小小心灵勇士" />
      </div>
    );
  }

  return (
    <div className={`hero-art ${large ? "large" : ""}`}>
      <div className="hero-cape" />
      <div className="hero-head">
        <span className="hero-hair" />
        <i className="eye left" />
        <i className="eye right" />
        <b className="smile" />
      </div>
      <div className="hero-body">
        <span className="heart-gem" />
        <span className="hero-arm arm-left" />
        <span className="hero-arm arm-right" />
      </div>
      <div className="hero-shield" />
      <div className="hero-boots" />
    </div>
  );
}

export function MonsterArt({ monster, small, showcase, stage }) {
  const image = MONSTER_ART[monster.id] || MONSTER_ART[monster.emotion] || null;

  if (image) {
    return (
      <div className={`monster-illustration ${small ? "small" : ""} ${showcase ? "showcase" : ""} ${stage ? "stage" : ""}`}>
        <img src={image} alt={monster.name || "情绪怪物"} />
      </div>
    );
  }

  return (
    <div className={`monster-art ${monster.emotion} ${small ? "small" : ""} ${showcase ? "showcase" : ""}`}>
      <div className="aura" />
      <div className="horn h1" />
      <div className="horn h2" />
      <div className="m-eye e1" />
      <div className="m-eye e2" />
      <div className="mouth" />
      <div className="mark one" />
      <div className="mark two" />
      <div className="mark three" />
    </div>
  );
}
