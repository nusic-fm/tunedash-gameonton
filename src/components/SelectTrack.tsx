import { Box, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import {
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { CoverV1, VoiceV1Cover } from "../services/db/coversV1.service";
import { useEffect, useState } from "react";
import {
  downloadAudioFiles,
  marbleRaceOnlyInstrument,
  stopAndDestroyPlayers,
} from "../hooks/useTonejs";
import { createRandomNumber } from "../helpers";
import LongImageMotionButton from "./Buttons/LongImageMotionButton";
import HeadsetRoundedIcon from "@mui/icons-material/HeadsetRounded";

type Props = {
  coversSnapshot: QuerySnapshot<DocumentData>;
  onTrackSelected: (
    coverDoc: CoverV1,
    coverId: string,
    voiceId: VoiceV1Cover | null
  ) => void;
  selectedCoverDocId: string;
  onNextPageClick: () => void;
};

const SelectTrack = ({
  coversSnapshot,
  onTrackSelected,
  onNextPageClick,
  selectedCoverDocId,
}: Props) => {
  const [downloadingCoverId, setDownloadingCoverId] = useState<string>("");

  const downloadInstrumental = async (
    _coverId: string,
    _coverDoc: CoverV1,
    _voiceInfo: VoiceV1Cover
  ) => {
    setDownloadingCoverId(_coverId);
    stopAndDestroyPlayers();
    await downloadAudioFiles(
      [
        `https://voxaudio.nusic.fm/covers/${_coverId}/instrumental.mp3`,
        // ...(_coverDoc ? _coverDoc.voices.slice(0, 5) : selectedVoices)
        //   .map((v) => v.id)
        //   .map(
        //     (v) =>
        //       `https://voxaudio.nusic.fm/covers/${
        //         _coverId || selectedCoverDocId
        //       }/${v}.mp3`
        //   ),
        `https://voxaudio.nusic.fm/covers/${_coverId}/${_voiceInfo.id}.mp3`,
      ],
      (progress: number) => {
        console.log(progress);
      }
    );
    marbleRaceOnlyInstrument(
      _coverId,
      _coverDoc.bpm || 120,
      _coverDoc.vocalsStartOffset || 0,
      _coverDoc.vocalsEndOffset || _coverDoc.duration || 0
    );
    setDownloadingCoverId("");
  };

  return (
    <Stack
      width={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={4}
      height={"100%"}
    >
      <img
        src={"/assets/tunedash/select-track.png"}
        alt="select-track"
        width={192}
        style={{ objectFit: "contain", backgroundRepeat: "no-repeat" }}
      />
      <Stack
        sx={{
          background: `url(/assets/tunedash/select-track-rect.png)`,
          width: window.innerWidth > 345 ? 345 : window.innerWidth,
          height: 452,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
        }}
        gap={2}
        alignItems={"center"}
        py={2}
        // px={1}
      >
        {coversSnapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
            const coverDoc = doc.data() as CoverV1;
            return (
              <Box
                sx={{
                  background:
                    doc.id === "fEGU8n7EdEqhtMIfse09"
                      ? `url(/assets/tunedash/sr.png)`
                      : `url(/assets/tunedash/track-rect.png)`,
                  width: 312,
                  height: doc.id === "fEGU8n7EdEqhtMIfse09" ? 85 : 67,
                  backgroundRepeat: "no-repeat",
                }}
                key={doc.id}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                gap={1}
                zIndex={9}
                onClick={async () => {
                  if (doc.id !== selectedCoverDocId) {
                    const randomVoice =
                      coverDoc.voices[
                        createRandomNumber(0, coverDoc.voices.length - 1)
                      ];
                    await downloadInstrumental(doc.id, coverDoc, randomVoice);
                    onTrackSelected(coverDoc, doc.id, randomVoice);
                  }
                }}
              >
                <Box width={"70%"} sx={{ overflow: "hidden" }}>
                  <Typography
                    sx={{
                      // ellipsis
                      whiteSpace: "nowrap",
                      // overflow: "hidden",
                      // textOverflow: "ellipsis",
                    }}
                    alignSelf={"center"}
                    // width={"70%"}
                    fontSize={14}
                    id={selectedCoverDocId === doc.id ? "scroll-text" : ""}
                  >
                    {coverDoc.title}
                  </Typography>
                </Box>
                {downloadingCoverId === doc.id ? (
                  <CircularProgress
                    variant="indeterminate"
                    size={20}
                    sx={{ color: "#000" }}
                  />
                ) : selectedCoverDocId === doc.id ? (
                  <HeadsetRoundedIcon />
                ) : (
                  // <video
                  //   src="/assets/tunedash/playing.webm"
                  //   autoPlay
                  //   loop
                  //   width={62}
                  //   height={24}
                  //   style={{ borderRadius: "16px", objectFit: "cover" }}
                  // />
                  <Chip
                    label="Select"
                    size="small"
                    clickable
                    sx={{ backgroundColor: "#000", color: "#FFA500" }}
                  />
                )}
              </Box>
            );
          }
        )}
      </Stack>
      <LongImageMotionButton
        onClick={
          () => !downloadingCoverId && selectedCoverDocId && onNextPageClick()
          // onTrackSelected(
          //   selectedSnapshot.data() as CoverV1,
          //   selectedSnapshot.id,
          //   currentlyPlayingVoiceInfo || null
          // )
        }
        name="Choose Voice"
        width={230}
        height={75}
      />
    </Stack>
  );
};

export default SelectTrack;
