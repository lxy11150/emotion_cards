import { HeroArt, StoryArtwork } from "../components/Artwork.jsx";

export function VictoryScreen({ onNew, onHome }) {
  return (
    <section className="victory-screen">
      <div className="victory-screen__art">
        <div className="victory-screen__scene">
          <StoryArtwork index={0} title="情绪王国重新亮起来了" />
        </div>
        <div className="victory-screen__hero">
          <HeroArt large />
        </div>
      </div>

      <div className="victory-screen__copy">
        <p className="eyebrow">情绪王国重新亮起来了</p>
        <h1>通关啦</h1>
        <p>
          你没有把情绪赶走，而是学会了听懂它们、照顾它们。居民们又可以开心、难过、生气、害怕、惊讶，也可以慢慢恢复平静。
        </p>
        <div className="victory-screen__actions">
          <button className="primary" onClick={onNew}>
            再玩一次
          </button>
          <button onClick={onHome}>返回主页</button>
        </div>
      </div>
    </section>
  );
}
