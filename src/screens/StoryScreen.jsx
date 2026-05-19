import { StoryArtwork } from "../components/Artwork.jsx";

export function StoryScreen({ slide, index, total, onNext, onSkip }) {
  return (
    <section className="story-screen">
      <div className="story-screen__art">
        <div className="comic-frame">
          <StoryArtwork index={index} title={slide.title} />
        </div>
      </div>

      <div className="story-screen__copy">
        <p className="eyebrow">漫画剧情 {index + 1}/{total}</p>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <div className="story-screen__actions">
          <button className="primary" onClick={onNext}>
            {index === total - 1 ? "打开地图" : "下一话"}
          </button>
          <button onClick={onSkip}>跳过剧情</button>
        </div>
      </div>
    </section>
  );
}
