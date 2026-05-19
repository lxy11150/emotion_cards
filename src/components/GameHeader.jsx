export function GameHeader({
  game,
  muted,
  onMute,
  onRules,
  onAtlas,
  onSaveExit,
  onRestart,
  onAbandon,
}) {
  return (
    <header className="game-header">
      <div className="game-header__title">
        <p>第 {game.level + 1} 关</p>
        <strong>{game.screen === "victory" ? "情绪王国" : game.screen === "story" ? "冒险开始" : game.screen === "map" ? "王国路线" : game.screen === "monsterIntro" ? "挑战准备" : "卡牌战斗"}</strong>
        <span>{game.screen === "battle" ? "整理情绪，帮助居民找回平静" : game.screen === "map" ? "沿着发光小路继续前进" : "慢慢来，我们一起推进"}</span>
      </div>
      <div className="game-header__actions">
        <button onClick={onRules}>规则</button>
        <button onClick={onAtlas}>图鉴</button>
        <button onClick={onMute}>{muted ? "语音关" : "语音开"}</button>
        {game.screen === "battle" && <button onClick={onRestart}>重开本关</button>}
        <button onClick={onSaveExit}>保存并退出</button>
        <button onClick={onAbandon}>放弃并新游戏</button>
      </div>
    </header>
  );
}
