import { HeroArt, StoryArtwork } from "../components/Artwork.jsx";
import { ruby } from "../game/utils/text.js";

export function HomeScreen({ onStartNew, onContinue, canContinue, onRules, onAtlas }) {
  return (
    <main className="home-screen">
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="eyebrow">{ruby("情绪王国", "qing xu wang guo")}</p>
          <h1>{ruby("情绪卡牌小冒险", "qing xu ka pai xiao mao xian")}</h1>
          <p>
            带着卡牌和勇气出发，认识悲伤、愤怒、害怕、惊讶和厌恶，帮情绪王国重新亮起来。
          </p>
          <div className="home-hero__actions">
            <button className="primary" onClick={onStartNew}>
              新游戏
            </button>
            <button onClick={onContinue} disabled={!canContinue}>
              继续游戏
            </button>
            <button onClick={onRules}>规则</button>
            <button onClick={onAtlas}>情绪图鉴</button>
          </div>
        </div>

        <div className="home-hero__art">
          <div className="home-hero__spotlight">
            <StoryArtwork index={0} title="情绪王国" />
          </div>
          <div className="home-hero__mascot">
            <HeroArt large />
          </div>
        </div>
      </section>
    </main>
  );
}
