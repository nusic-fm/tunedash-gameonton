import { Stack, Box, Typography } from "@mui/material";
import { VoiceV1Cover } from "../services/db/coversV1.service";
import { getVoiceAvatarPath } from "../helpers";
import { useState } from "react";
import LongImageMotionButton from "./Buttons/LongImageMotionButton";
import { switchVocalsByDownloading } from "../hooks/useTonejs";

type Props = {
  onPrimaryVoiceSelected: (voiceInfo: VoiceV1Cover) => void;
  voices: VoiceV1Cover[];
  primaryVoiceInfo: VoiceV1Cover | null;
  selectedCoverId: string;
};

const ChoosePrimaryVoice = ({
  onPrimaryVoiceSelected,
  voices,
  primaryVoiceInfo,
  selectedCoverId,
}: Props) => {
  const [selectedVoiceInfo, setSelectedVoiceInfo] = useState<VoiceV1Cover>(
    primaryVoiceInfo || voices[0]
  );

  return (
    <Stack
      gap={2}
      height={"100%"}
      width={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      position={"relative"}
    >
      <Stack alignItems={"center"} gap={0.5}>
        <img
          src={getVoiceAvatarPath(selectedVoiceInfo.id)}
          width={105}
          height={105}
          style={{
            borderRadius: "12px",
            cursor: "pointer",
          }}
        />
        <Box
          px={2}
          // width={100}
          height={20}
          sx={{
            background: `url(/assets/tunedash/track-rect.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {selectedVoiceInfo.name}
          </Typography>
        </Box>
      </Stack>
      <Box
        width={window.innerWidth > 350 ? 350 : window.innerWidth}
        height={430}
        sx={{
          background: "url(/assets/tunedash/menu-voice-rect.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexWrap={"wrap"}
          height={"85%"}
          width={"100%"}
          // my={2}
          borderRadius={10}
          sx={{
            overflowY: "auto",
          }}
          gap={3}
        >
          {voices.map((voice, idx) => (
            <Stack key={idx}>
              <Box
                onClick={() => {
                  setSelectedVoiceInfo(voice);
                  switchVocalsByDownloading(
                    selectedCoverId,
                    voice.id,
                    selectedVoiceInfo.id
                  );
                }}
                position={"relative"}
                width={65}
                height={65}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                borderRadius={"50%"}
                border={"4px solid #AABBCC"}
              >
                {voice.id === selectedVoiceInfo.id && (
                  <img
                    src={"/assets/tunedash/focus.png"}
                    width={"100%"}
                    height={"100%"}
                    style={{
                      zIndex: 0,
                      cursor: "pointer",
                      // zoom: 1.1,
                      transform: "scale(1.2)",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
                <img
                  src={getVoiceAvatarPath(voice.id)}
                  width={60}
                  height={60}
                  style={{
                    borderRadius: "50%",
                    cursor: "pointer",
                    zIndex: 1,
                  }}
                />
              </Box>
              <Typography
                color={"#f0f0f0"}
                fontSize={12}
                fontWeight={900}
                textAlign={"center"}
              >
                {voice.name.slice(0, 10)}
                {voice.name.length > 10 ? "..." : ""}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Box>
      <Box position={"absolute"} bottom={20} zIndex={100}>
        <LongImageMotionButton
          onClick={() => {
            onPrimaryVoiceSelected(selectedVoiceInfo);
          }}
          name="Proceed"
          width={230}
          height={75}
        />
      </Box>
      {/* <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: "url(/assets/tunedash/proceed.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          width: 250,
          height: 83,
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => {
          onPrimaryVoiceSelected(selectedVoiceInfo);
        }}
      /> */}
    </Stack>
  );
};

export default ChoosePrimaryVoice;
