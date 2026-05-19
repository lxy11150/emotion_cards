import { useState } from "react";
import { GameHeader } from "./components/GameHeader.jsx";
import { AtlasModal, AtlasPage, InfoModal, InfoPage } from "./components/InfoPanels.jsx";
import { STORY_SLIDES } from "./game/data/content.js";
import { useEmotionGame } from "./game/hooks/useEmotionGame.js";
import { BattleScreen } from "./screens/BattleScreen.jsx";
import { HomeScreen } from "./screens/HomeScreen.jsx";
import { MapScreen } from "./screens/MapScreen.jsx";
import { MonsterIntroScreen } from "./screens/MonsterIntroScreen.jsx";
import { StoryScreen } from "./screens/StoryScreen.jsx";
import { VictoryScreen } from "./screens/VictoryScreen.jsx";

export default function App() {
  const [shellView, setShellView] = useState("home");
  const [showRules, setShowRules] = useState(false);
  const [showAtlas, setShowAtlas] = useState(false);
  const {
    game,
    monster,
    saveExists,
    showPile,
    setShowPile,
    muted,
    setMuted,
    startNew,
    continueGame,
    nextStory,
    skipStory,
    openMonsterIntro,
    backToMap,
    startChallenge,
    saveAndExit,
    playCard,
    endTurn,
    restartLevel,
    abandon,
    returnHome,
    storyCount,
  } = useEmotionGame();

  async function handleContinue() {
    await continueGame();
  }

  if (shellView === "rules") {
    return <InfoPage title="游戏规则" onBack={() => setShellView("home")} />;
  }

  if (shellView === "atlas") {
    return <AtlasPage onBack={() => setShellView("home")} />;
  }

  if (!game) {
    return (
      <HomeScreen
        onStartNew={startNew}
        onContinue={handleContinue}
        canContinue={saveExists}
        onRules={() => setShellView("rules")}
        onAtlas={() => setShellView("atlas")}
      />
    );
  }

  return (
    <main className={`game-shell game-shell--${game.screen}`}>
      <GameHeader
        game={game}
        muted={muted}
        onMute={() => setMuted((value) => !value)}
        onRules={() => setShowRules(true)}
        onAtlas={() => setShowAtlas(true)}
        onSaveExit={saveAndExit}
        onRestart={restartLevel}
        onAbandon={abandon}
      />

      {game.screen === "story" && (
        <StoryScreen
          slide={STORY_SLIDES[game.storyIndex]}
          index={game.storyIndex}
          total={storyCount}
          onNext={nextStory}
          onSkip={skipStory}
        />
      )}

      {game.screen === "map" && <MapScreen game={game} onOpenIntro={openMonsterIntro} />}

      {game.screen === "monsterIntro" && (
        <MonsterIntroScreen monster={monster} onBack={backToMap} onStart={startChallenge} />
      )}

      {game.screen === "battle" && (
        <BattleScreen
          game={game}
          monster={monster}
          showPile={showPile}
          setShowPile={setShowPile}
          onPlayCard={playCard}
          onEndTurn={endTurn}
          onRestart={restartLevel}
          onHome={returnHome}
        />
      )}

      {game.screen === "victory" && <VictoryScreen onNew={startNew} onHome={returnHome} />}

      {showRules && <InfoModal title="游戏规则" onClose={() => setShowRules(false)} />}
      {showAtlas && <AtlasModal onClose={() => setShowAtlas(false)} />}
    </main>
  );
}
