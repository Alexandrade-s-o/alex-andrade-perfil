import "./index.css";
import { Composition } from "remotion";
import { AlexPresentation, DURATION_FRAMES } from "./AlexPresentation";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AlexPresentation"
        component={AlexPresentation}
        durationInFrames={DURATION_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
