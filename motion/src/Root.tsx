import "./index.css";
import { Composition } from "remotion";
import { AusosCard, AUSOS_CARD } from "./AusosCard";
import { WinkingstarHero, WINKINGSTAR_HERO } from "./WinkingstarHero";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AusosCard"
        component={AusosCard}
        durationInFrames={AUSOS_CARD.durationInFrames}
        fps={AUSOS_CARD.fps}
        width={AUSOS_CARD.width}
        height={AUSOS_CARD.height}
      />
      <Composition
        id="WinkingstarHero"
        component={WinkingstarHero}
        durationInFrames={WINKINGSTAR_HERO.durationInFrames}
        fps={WINKINGSTAR_HERO.fps}
        width={WINKINGSTAR_HERO.width}
        height={WINKINGSTAR_HERO.height}
      />
    </>
  );
};
