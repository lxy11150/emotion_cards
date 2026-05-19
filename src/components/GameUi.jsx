import { ABILITIES } from "../game/data/content.js";
import { CARD_ART } from "../game/data/art.js";
import { ruby } from "../game/utils/text.js";

export function Meter({ value, max, label, tone = "sunrise" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={`meter meter--${tone}`} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
      <b>{label}</b>
    </div>
  );
}

export function BattleHealthBar({ hp, maxHp, shield = 0, label, align = "left" }) {
  const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const shieldPct = Math.max(0, Math.min(100 - hpPct, (shield / maxHp) * 100));

  return (
    <div className={`battle-health battle-health--${align}`} aria-label={label}>
      <div className="battle-health__row">
        <div className={`battle-health__track${shield ? " battle-health__track--shielded" : ""}`}>
          <span className="battle-health__hp" style={{ width: `${hpPct}%` }} />
          <span className="battle-health__shield" style={{ left: `${hpPct}%`, width: `${shieldPct}%` }} />
        </div>
        {shield > 0 && (
          <span className="battle-health__shield-chip" aria-label={`护盾 ${shield}`}>
            <i aria-hidden="true" />
            {shield}
          </span>
        )}
      </div>
      <b>{label}</b>
    </div>
  );
}

export function EnergyBoltBar({ value, max = 3 }) {
  return (
    <div className="energy-bolt-bar" aria-label={`情绪能量 ${value}/${max}`}>
      <span>情绪能量</span>
      <div className="energy-bolt-bar__icons">
        {Array.from({ length: max }, (_, index) => (
          <i key={index} className={index < value ? "active" : ""} aria-hidden="true" />
        ))}
      </div>
      <b>
        {value}/{max}
      </b>
    </div>
  );
}

export function artForCard(card) {
  if (card.type === "attack") return CARD_ART.attack;
  if (card.type === "defense") return CARD_ART.defense;
  if (card.kind === "joy") return CARD_ART.joy;
  if (card.target) return CARD_ART[card.target] || CARD_ART.joy;
  return CARD_ART.joy;
}

function detailForCard(card) {
  return card.type === "attack"
    ? "造成 6 点伤害"
    : card.type === "defense"
      ? "获得 5 点护甲"
      : card.desc;
}

export function CardButton({ card, disabled, guided, locked, fanStyle, onClick }) {
  const ability = card.type === "ability" ? ABILITIES[card.ability] : null;
  const className = `card-button ${card.type}${card.confusedCost ? " confused" : ""}${guided ? " guided" : ""}${locked ? " locked" : ""}`;
  const image = artForCard(card);
  const detail = detailForCard(card);

  return (
    <button className={className} style={{ "--card": ability?.color, ...fanStyle }} disabled={disabled} onClick={onClick}>
      {guided && (
        <span className="pointer-hand" aria-hidden="true">
          <span />
        </span>
      )}
      <span className="cost-badge">{card.cost}</span>
      <div className="card-button__art">
        <img src={image} alt="" aria-hidden="true" />
      </div>
      <div className="card-button__content">
        <strong>{ruby(card.name, card.pinyin)}</strong>
        <small>{detail}</small>
      </div>
    </button>
  );
}

export function PileStackButton({ cards, kind, onClick }) {
  const previewCards = cards.slice(0, 3);
  const visibleCards = previewCards.length ? previewCards : [null];
  const label = `${kind === "deck" ? "抽牌堆" : "弃牌堆"} ${cards.length}`;

  return (
    <button className={`pile-stack pile-stack--${kind}`} onClick={onClick} aria-label={label} title={label}>
      <span className="pile-stack__cards" aria-hidden="true">
        {visibleCards.map((card, index) => {
          const ability = card?.type === "ability" ? ABILITIES[card.ability] : null;

          return (
            <span
              key={card?.id || `empty-${index}`}
              className={`pile-mini-card ${card ? card.type : "empty"}`}
              style={{ "--card": ability?.color, "--mini-index": index }}
            >
              {card ? <img src={artForCard(card)} alt="" /> : <i />}
            </span>
          );
        })}
      </span>
      <b>{cards.length}</b>
    </button>
  );
}

export function Badge({ children, tone, className = "" }) {
  const extraClass = className ? ` ${className}` : "";
  return (
    <span className={`badge${extraClass}`} style={tone ? { background: tone } : undefined}>
      {children}
    </span>
  );
}

export function PileModal({ title, cards, onClose }) {
  return (
    <div className="modal-shell">
      <div className="dialog-card dialog-card--pile">
        <h2>{title}</h2>
        <div className="pile-card-grid">
          {cards.map((card) => {
            const ability = card.type === "ability" ? ABILITIES[card.ability] : null;

            return (
              <article key={card.id} className={`pile-card ${card.type}`} style={{ "--card": ability?.color }}>
                <img src={artForCard(card)} alt="" aria-hidden="true" />
                <strong>{ruby(card.name, card.pinyin)}</strong>
                <small>{detailForCard(card)}</small>
              </article>
            );
          })}
          {cards.length === 0 && <p className="pile-empty">空空的</p>}
        </div>
        <button className="primary" onClick={onClose}>
          知道了
        </button>
      </div>
    </div>
  );
}
