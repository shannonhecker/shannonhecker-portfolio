import "./index.css";
import { Composition } from "remotion";
import { AusosCard, AUSOS_CARD } from "./AusosCard";

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
    </>
  );
};
