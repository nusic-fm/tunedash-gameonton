import { Stack, Fab, Chip } from "@mui/material";
import SmallImageMotionButton from "./Buttons/SmallImageMotionButton";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import { getToneStatus, toggleMuteAudio } from "../hooks/useTonejs";
import { useEffect, useState } from "react";

type Props = {
  onStartClick: () => void;
  showIosNotice: boolean;
};

const ScreenOne = ({ onStartClick, showIosNotice }: Props) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const { isMuted } = getToneStatus();
    setIsMuted(isMuted);
  }, []);

  return (
    <Stack
      gap={4}
      height={"100%"}
      width={"100%"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      {showIosNotice && <Chip label="No Audio? Switch off silent mode." />}
      <Stack alignItems={"center"} gap={1}>
        <SmallImageMotionButton onClick={onStartClick} name="Start" />
        <Fab
          color="warning"
          size="small"
          onClick={() => {
            toggleMuteAudio();
            const { isMuted } = getToneStatus();
            setIsMuted(isMuted);
          }}
        >
          {isMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
        </Fab>
      </Stack>
    </Stack>
  );
};

export default ScreenOne;
