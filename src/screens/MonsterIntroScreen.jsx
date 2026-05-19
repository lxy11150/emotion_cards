import { MonsterArt } from "../components/Artwork.jsx";
import { EMOTIONS } from "../game/data/content.js";
import { ruby } from "../game/utils/text.js";

export function MonsterIntroScreen({ monster, onBack, onStart }) {
  const emotion = EMOTIONS[monster.emotion];

  return (
    <section className="intro-screen">
      <div className="intro-screen__art" style={{ "--tone": emotion?.color || "#6957c8" }}>
        <MonsterArt monster={monster} showcase />
      </div>

      <div className="intro-screen__copy">
        <p className="eyebrow">{monster.boss ? "最终挑战" : ruby(emotion.region, emotion.regionPinyin)}</p>
        <h1>{ruby(monster.name, monster.pinyin)}</h1>
        <p>{monster.intro}</p>
        {!monster.boss && (
          <p>{emotion.mapIntro} 这片区域需要你用「{emotion.cure}」的力量帮居民找回平静。</p>
        )}
        {monster.boss && <p>这次会同时出现多种负面情绪。别着急，一张一张整理就好。</p>}
        <div className="intro-screen__actions">
          <button className="primary" onClick={onStart}>
            开始挑战
          </button>
          <button onClick={onBack}>回地图</button>
        </div>
      </div>
    </section>
  );
}
