import { BattleBackdrop, GuideSprite, HeroArt, MonsterArt } from "../components/Artwork.jsx";
import { Badge, BattleHealthBar, CardButton, EnergyBoltBar, PileModal, PileStackButton } from "../components/GameUi.jsx";
import { EMOTIONS } from "../game/data/content.js";
import { ruby } from "../game/utils/text.js";

function fanStyle(index, total) {
  const center = (total - 1) / 2;
  const offset = index - center;

  return {
    "--fan-rotate": `${offset * 6}deg`,
    "--fan-lift": `${Math.abs(offset) * 7}px`,
    "--fan-shift": `${offset * 10}px`,
    zIndex: 20 + index,
  };
}

export function BattleScreen({
  game,
  monster,
  showPile,
  setShowPile,
  onPlayCard,
  onEndTurn,
  onRestart,
  onHome,
}) {
  const guidedEmotion = game.guidedEmotion;
  const guidedAbilityName = guidedEmotion ? EMOTIONS[guidedEmotion].cure : null;
  const monsterEmotion = EMOTIONS[monster.emotion];
  const intentDetail =
    game.intent.detail ||
    {
      attack: "怪物准备直接进攻。",
      shield: "怪物准备先给自己加护盾。",
      attackShield: "怪物这回合会边打边挡。",
      debuff: "怪物要把负面情绪丢过来。",
      debuffAll: "Boss 要发动情绪风暴。",
    }[game.intent.type];

  return (
    <>
      <section className="battle-screen battle-screen--spire">
        <section className="battle-arena">
          <div className="battle-arena__backdrop">
            <BattleBackdrop />
          </div>

          <div className="battle-top-strip">
            <div className="battle-mid__guide">
              <GuideSprite mood={game.tip?.emotion || (game.joy ? "joy" : "steady")} />
            </div>

            <div className="battle-tip-panel">
              <p className="battle-tip-panel__flow">
                <strong>{game.tip?.title}</strong>
                <span>{game.tip?.text}</span>
              </p>
            </div>
          </div>

          <div className="battle-intent-float">
            <div className="battle-intent-panel">
              <p className="eyebrow">怪物意图</p>
              <strong>{game.intent.label}</strong>
              <p>{intentDetail}</p>
            </div>
          </div>

          <div className="battle-energy-float">
            <EnergyBoltBar value={game.energy} />
            {guidedEmotion && <div className="guided-pill">请先使用「{guidedAbilityName}」</div>}
          </div>

          <aside className="battle-unit battle-unit--hero">
            <div className="battle-unit__status battle-unit__status--hero">
              <Badge className="badge--turn">回合 {game.turn}</Badge>
              {game.joy && <Badge className="badge--joy">快乐</Badge>}
              {game.debuffs.map((key) => (
                <Badge key={key} tone={EMOTIONS[key].color}>
                  {EMOTIONS[key].name}
                </Badge>
              ))}
              {game.debuffs.length === 0 && <Badge className="badge--clear">状态轻松</Badge>}
            </div>

            <div className="battle-unit__portrait battle-unit__portrait--hero">
              <HeroArt />
            </div>

            <div className="battle-unit__footer">
              <strong>{ruby("小小心灵勇士", "xiao xiao xin ling yong shi")}</strong>
              <BattleHealthBar
                hp={game.playerHp}
                maxHp={game.maxHp}
                shield={game.playerShield}
                align="center"
                label={`${game.playerHp}/${game.maxHp}`}
              />
            </div>
          </aside>

          <aside className="battle-unit battle-unit--monster">
            <div className="battle-unit__status battle-unit__status--monster">
              <Badge tone={monsterEmotion?.color || "#6957c8"}>
                {monster.boss ? "综合情绪" : monsterEmotion.name}
              </Badge>
              <Badge className="badge--region">{monster.boss ? "王城中心" : monsterEmotion.region}</Badge>
              {monster.boss && game.debuffs.length === 0 && game.bossCooldown > 0 && (
                <Badge className="badge--storm">风暴等待 {game.bossCooldown}</Badge>
              )}
            </div>

            <div className="battle-unit__portrait battle-unit__portrait--monster">
              <MonsterArt monster={monster} stage />
            </div>

            <div className="battle-unit__footer battle-unit__footer--monster">
              <strong>{ruby(monster.name, monster.pinyin)}</strong>
              <BattleHealthBar
                hp={Math.max(0, game.monsterHp)}
                maxHp={monster.hp}
                shield={game.monsterShield}
                align="center"
                label={`${Math.max(0, game.monsterHp)}/${monster.hp}`}
              />
            </div>
          </aside>

          <section className="battle-bottom-bar">
            <PileStackButton cards={game.deck} kind="deck" onClick={() => setShowPile("deck")} />

            <div className="battle-hand-zone">
              <div className="battle-hand-fan">
              {game.hand.map((card, index) => {
                const guided = guidedEmotion && card.type === "ability" && card.target === guidedEmotion;
                const joyBlocked = card.kind === "joy" && game.debuffs.length > 0;
                const locked = Boolean(guidedEmotion && !guided) || joyBlocked;

                return (
                    <CardButton
                      key={card.id}
                      card={card}
                      guided={guided}
                      locked={locked}
                      fanStyle={fanStyle(index, game.hand.length)}
                      disabled={card.cost > game.energy || game.ended || locked}
                      onClick={() => onPlayCard(card)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="battle-side-actions">
              <PileStackButton cards={game.discard} kind="discard" onClick={() => setShowPile("discard")} />

              <button className="primary battle-endturn" onClick={onEndTurn} disabled={Boolean(guidedEmotion)}>
                结束回合
              </button>
            </div>
          </section>
        </section>
      </section>

      {game.ended && (
        <div className="modal-shell">
          <div className="dialog-card dialog-card--compact">
            <h2>休息一下</h2>
            <p>{game.tip.text}</p>
            <div className="battle-result-actions">
              <button className="primary" onClick={onRestart}>
                重新挑战
              </button>
              <button onClick={onHome}>返回主页</button>
            </div>
          </div>
        </div>
      )}

      {showPile && (
        <PileModal
          title={showPile === "deck" ? "抽牌堆" : "弃牌堆"}
          cards={game[showPile]}
          onClose={() => setShowPile(null)}
        />
      )}
    </>
  );
}
