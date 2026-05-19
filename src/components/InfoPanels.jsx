import { HeroArt, MonsterArt } from "./Artwork.jsx";
import { CARD_ART } from "../game/data/art.js";
import { EMOTIONS, MONSTERS } from "../game/data/content.js";
import { ruby } from "../game/utils/text.js";

const ATLAS_ENTRIES = [
  {
    key: "joy",
    name: "快乐",
    pinyin: "kuai le",
    color: "#f7d34b",
    gameImpact: "快乐会让攻击和防御都更有力，但有负面情绪时暂时不能进入快乐状态。",
    realRisk: "快乐不是一直吵闹，而是感觉轻松、有力量，也更愿意和别人一起玩。",
    cure: "快乐",
    afterCure: "当你看见希望、被理解，或者做成一件事时，快乐就会慢慢亮起来。",
    art: CARD_ART.joy,
  },
  ...Object.entries(EMOTIONS).map(([key, emotion]) => ({ key, ...emotion })),
];

export function InfoPage({ title, onBack }) {
  return (
    <main className="info-page">
      <button onClick={onBack}>返回</button>
      <h1>{title}</h1>
      <InfoContent />
    </main>
  );
}

export function InfoModal({ title, onClose }) {
  return (
    <div className="modal-shell">
      <div className="dialog-card dialog-card--wide">
        <button className="close-button" onClick={onClose}>
          关闭
        </button>
        <h2>{title}</h2>
        <InfoContent />
      </div>
    </div>
  );
}

export function AtlasPage({ onBack }) {
  return (
    <main className="info-page atlas-page">
      <button onClick={onBack}>返回</button>
      <h1 className="atlas-title">情绪图鉴</h1>
      <AtlasContent />
    </main>
  );
}

export function AtlasModal({ onClose }) {
  return (
    <div className="modal-shell">
      <div className="dialog-card dialog-card--wide">
        <button className="close-button" onClick={onClose}>
          关闭
        </button>
        <h2 className="atlas-title">情绪图鉴</h2>
        <AtlasContent />
      </div>
    </div>
  );
}

export function InfoContent() {
  return (
    <>
      <section className="info-hero">
        <div className="info-hero__art">
          <HeroArt />
        </div>
        <div>
          <h2>小小心灵勇士</h2>
          <p>每回合抽满 6 张牌，有 3 点情绪能量。攻击和防御花 1 点，快乐花 2 点。</p>
        </div>
      </section>

      <section className="info-grid">
        <p>护甲只保护这一回合。结束回合后，怪物会按显示的意图行动。</p>
        <p>快乐会让攻击、防御翻倍。被怪物施加负面情绪时，快乐会消失；有负面情绪时也不能进入快乐状态。</p>
        <p>进入下一关时，手牌、弃牌堆和抽牌堆会像新游戏一样重新洗牌抽牌。</p>
        <p>重开本关会回到本关开始时的血量。保存并退出后，可以从继续游戏回来。</p>
      </section>

      <section className="rules-monsters">
        {MONSTERS.map((monster) => (
          <article key={monster.id}>
            <MonsterArt monster={monster} small />
            <strong>{monster.name}</strong>
            <span>{monster.rulesText || (monster.boss ? "综合情绪" : EMOTIONS[monster.emotion].effect)}</span>
          </article>
        ))}
      </section>
    </>
  );
}

export function AtlasContent() {
  return (
    <section className="atlas-grid">
      {ATLAS_ENTRIES.map((emotion) => (
        <article key={emotion.key} style={{ "--tone": emotion.color }}>
          <div className="atlas-grid__art">
            {emotion.key === "joy" ? (
              <img src={emotion.art} alt="快乐能力" />
            ) : (
              <MonsterArt monster={{ id: emotion.key, emotion: emotion.key, name: emotion.name }} small />
            )}
          </div>
          <h2>{ruby(emotion.name, emotion.pinyin)}</h2>
          <p>{emotion.gameImpact}</p>
          <p>{emotion.realRisk}</p>
          <b>能力卡：{emotion.cure}</b>
          <span>{emotion.afterCure}</span>
        </article>
      ))}
    </section>
  );
}
