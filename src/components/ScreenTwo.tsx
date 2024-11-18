import { Stack } from "@mui/material";
import LongImageMotionButton from "./Buttons/LongImageMotionButton";

type Props = {
  onSingleRaceClick: () => void;
};

const ScreenTwo = ({ onSingleRaceClick }: Props) => {
  return (
    <Stack
      gap={4}
      height={"100%"}
      width={"100%"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <img src="/assets/tunedash/tune-dash.png" />
      <Stack
        width={290}
        height={330}
        sx={{
          background: "url(/assets/tunedash/menu-rect.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        spacing={2}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <LongImageMotionButton onClick={onSingleRaceClick} name="Single Race" />
        <LongImageMotionButton onClick={() => {}} name="Story Mode" disabled />
        <LongImageMotionButton onClick={() => {}} name="Multiplayer" disabled />
      </Stack>
    </Stack>
  );
};

export default ScreenTwo;
