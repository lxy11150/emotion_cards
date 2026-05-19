import { MapArtwork, MonsterArt } from "../components/Artwork.jsx";
import { EMOTIONS, MONSTERS } from "../game/data/content.js";
import { ruby } from "../game/utils/text.js";

const NODE_POSITIONS = [
  { top: "18%", left: "75%" },
  { top: "43%", left: "21%" },
  { top: "41%", left: "79%" },
  { top: "76%", left: "24%" },
  { top: "77%", left: "77%" },
  { top: "40%", left: "50%" },
];

export function MapScreen({ game, onOpenIntro }) {
  return (
    <section className="map-screen">
      <div className="map-screen__copy">
        <p className="eyebrow">{ruby("情绪王国地图", "qing xu wang guo di tu")}</p>
        <h1>沿着王国小路前进</h1>
        <p>
          路线图现在换成了王国探险卷轴。每击败一个情绪怪物，通往下一片区域的发光小路就会亮起来。
        </p>
      </div>

      <div className="map-board">
        <div className="map-board__art">
          <MapArtwork />
        </div>

        {MONSTERS.map((monster, index) => {
          const emotion = EMOTIONS[monster.emotion];
          const cleared = game.clearedLevels.includes(index);
          const current = index === game.level;
          const locked = index > game.level;
          const position = NODE_POSITIONS[index];

          return (
            <button
              key={monster.id}
              className={`map-node ${cleared ? "cleared" : ""} ${current ? "current" : ""}`}
              style={{ "--tone": emotion?.color || "#6957c8", top: position.top, left: position.left }}
              disabled={!current || locked}
              onClick={() => onOpenIntro(index)}
            >
              <MonsterArt monster={monster} small />
              <strong>{monster.name}</strong>
              <span>{monster.boss ? "王城中心" : emotion.region}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
