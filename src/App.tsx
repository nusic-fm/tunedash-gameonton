import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";

import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import {
  downloadAndPlayIntro,
  downloadAudioFiles,
  marbleRacePlayVocals,
  prepareVocalPlayers,
  toggleMuteAudio,
} from "./hooks/useTonejs";
import { CoverV1, VoiceV1Cover } from "./services/db/coversV1.service";
import {
  createUserDoc,
  updateGameResult,
  User,
} from "./services/db/user.service";
import { getSkinPath, getTrailPath, getVoiceAvatarPath } from "./helpers";
import ScreenOne from "./components/ScreenOne";
import ScreenTwo from "./components/ScreenTwo";
import ChoosePrimaryVoice from "./components/ChoosePrimaryVoice";
import { useCollection } from "react-firebase-hooks/firestore";
import { query, collection, where, documentId } from "firebase/firestore";
import { db } from "./services/firebase.service";
import VoicesClash from "./components/VoicesClash";
import SmallImageMotionButton from "./components/Buttons/SmallImageMotionButton";
import SelectTrack from "./components/SelectTrack";
import SlideUp from "./components/SlideUp";
import WebApp from "@twa-dev/sdk";
import { EventBus } from "./game/EventBus";
import LongImageMotionButton from "./components/Buttons/LongImageMotionButton";

export const tracks = ["01", "03", "06", "07", "16"];

// const gameBgPaths = [
//   "/assets/tunedash/bgs/home.png",
//   "/assets/tunedash/bgs/home-menu.png",
//   "/assets/tunedash/bgs/home-menu.png",
//   "/assets/tunedash/bgs/home-voice.png",
// ];
const getGameBgPath = (screenName: string) => {
  switch (screenName) {
    case "splash":
    case "start":
      return "/assets/tunedash/bgs/start.png";
    case "menu":
      return "/assets/tunedash/bgs/menu.png";
    case "select-track":
      return "/assets/tunedash/bgs/menu.png";
    case "choose-primary-voice":
      return "/assets/tunedash/bgs/voice.png";
    case "voices-clash":
      return "/assets/tunedash/bgs/voice.png";
    case "game-ready":
      return "/assets/tunedash/bgs/voice.png"; //TODO
  }
};

// const screenNames = ["splash", "start", "menu", "select-track", "choose-primary-voice", "voices-clash", "game"];

function App() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [coverDoc, setCoverDoc] = useState<CoverV1 | null>(null);
  const [selectedCoverDocId, setSelectedCoverDocId] = useState<string>("");
  const [selectedSkinPath, setSelectedSkinPath] = useState<string>(
    "sutureGradient01.png"
  );
  const [selectedTrailPath, setSelectedTrailPath] =
    useState<string>("chrome_ball.png");
  const [selectedTracksList, setSelectedTracksList] = useState<string[]>(() => {
    // Check in the localstorage if there are selected tracks
    // const localTracks = localStorage.getItem("selectedTracks");
    // if (localTracks) {
    //   const arr = JSON.parse(localTracks);
    //   // unique array
    //   return [...new Set(arr)].filter((t) =>
    //     tracks.includes(t as string)
    //   ) as string[];
    // }
    return tracks;
  });
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [startSectionIdx, setStartSectionIdx] = useState(1);
  const [noOfRaceTracks, setNoOfRaceTracks] = useState(10);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
  const canvasElemWidth = isMobileView ? window.innerWidth : 414;
  // isMobileView
  //     ? window.innerWidth > 414
  //         ? 414
  //         : window.innerWidth
  //     : 414;
  const [primaryVoiceInfo, setPrimaryVoiceInfo] = useState<VoiceV1Cover | null>(
    null
  );
  const [secondaryVoiceInfo, setSecondaryVoiceInfo] =
    useState<VoiceV1Cover | null>(null);
  const [screenName, setScreenName] = useState("splash");
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [showOpponentVoiceSelection, setShowOpponentVoiceSelection] =
    useState(false);
  const [showGameOverButtons, setShowGameOverButtons] = useState(false);
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [showIosNotice, setShowIosNotice] = useState(false);
  const [coversSnapshot, cssLoading, cssError] = useCollection(
    query(
      collection(db, "tunedash_covers"),
      where(documentId(), "in", [
        "HPF5qmOAAdfU4O9uJM5T",
        "7GskJxL0ldK9OGbl6e1Y",
        "fEGU8n7EdEqhtMIfse09",
        "i9aUmvBYqdlCjqtQLe8u",
        "lsUBEcaYfOidpvjUxpz1",
      ]) // random
    )
  );
  const downloadVocalsAndStartGame = async () => {
    if (primaryVoiceInfo && secondaryVoiceInfo) {
      const urls = [
        `https://voxaudio.nusic.fm/covers/${selectedCoverDocId}/instrumental.mp3`,
        `https://voxaudio.nusic.fm/covers/${selectedCoverDocId}/${primaryVoiceInfo.id}.mp3`,
        `https://voxaudio.nusic.fm/covers/${selectedCoverDocId}/${secondaryVoiceInfo?.id}.mp3`,
      ];
      await downloadAudioFiles(urls, (progress: number) => {
        console.log("progress", progress);
        setDownloadProgress(progress);
      });
      await prepareVocalPlayers(urls);
    }
  };

  useEffect(() => {
    if (coversSnapshot?.docs.length) {
      (async () => {
        await downloadAndPlayIntro();

        if (WebApp.initDataUnsafe.user) {
          try {
            const user = await createUserDoc(
              {
                firstName: WebApp.initDataUnsafe.user.first_name,
                lastName: WebApp.initDataUnsafe.user.last_name || "",
                username: WebApp.initDataUnsafe.user.username || "",
                id: WebApp.initDataUnsafe.user.id.toString(),
                photoUrl: WebApp.initDataUnsafe.user.photo_url || "",
                languageCode: WebApp.initDataUnsafe.user.language_code || "",
                isBot: WebApp.initDataUnsafe.user.is_bot || false,
                purchasedVoices: null,
              },
              WebApp.initDataUnsafe.user.id.toString()
            );
            setUserInfo(user);
          } catch (e) {
            // TODO: Handle error
          }
        }
        setIsDownloaded(true);
        // setScreenName("start");
      })();
      // const _coverDoc = coversSnapshot?.docs[0].data() as CoverV1;
      // const _coverId = coversSnapshot?.docs[0].id;
      // setCoverDoc(_coverDoc);
      // setSelectedCoverDocId(_coverId);
      // (async () => {
      //   // await downloadInstrumental(_coverId, _coverDoc);
      //   setScreenIdx(0);
      // })();
    }
  }, [coversSnapshot]);

  const onGameOver = async (
    isWinner: boolean,
    voices: VoiceV1Cover[],
    winningVoiceId: string
  ) => {
    setIsPlayingGame(false);
    setTimeout(
      () => {
        setShowGameOverButtons(true);
      },
      isWinner ? 2500 : 1800
    );
    if (userInfo?.id) {
      await updateGameResult(
        userInfo.id,
        selectedCoverDocId,
        isWinner,
        voices,
        winningVoiceId
      );
    }
  };

  useEffect(() => {
    EventBus.on("game-over", onGameOver);

    return () => {
      EventBus.removeListener("game-over", onGameOver);
    };
  }, [onGameOver]);

  return (
    <Stack id="app" gap={2} sx={{ width: "100%", height: "100vh" }}>
      {screenName === "splash" && (
        <SlideUp
          onSlideUp={async () => {
            if (WebApp.platform === "ios") {
              setShowIosNotice(true);
            }
            setScreenName("start");
            toggleMuteAudio();
          }}
          enableSlideUp={isDownloaded}
        />
      )}
      <Box width={"100%"} display="flex" justifyContent={"center"}>
        <Box
          display={"flex"}
          justifyContent="center"
          alignItems={"center"}
          width={canvasElemWidth}
        >
          <Box
            width={canvasElemWidth}
            height={"100vh"}
            sx={{
              background: `url(${getGameBgPath(screenName)})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              // borderRadius: 8,
            }}
            display="flex"
            alignItems={"start"}
            justifyContent={"center"}
          >
            <Stack
              // px={2}
              gap={4}
              // sx={{
              //     background: "rgba(0,0,0,0.6)",
              // }}
              height={"100%"}
              width={"100%"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              position={"relative"}
            >
              {screenName === "game" && isPlayingGame ? (
                <Box
                  position={"absolute"}
                  top={0}
                  left={0}
                  right={0}
                  width={"100%"}
                  display={"flex"}
                  justifyContent={"center"}
                  pt={1}
                >
                  <SmallImageMotionButton
                    name="Stop"
                    onClick={() => {
                      phaserRef.current?.game?.destroy(true);
                      phaserRef.current = null;
                      !!primaryVoiceInfo &&
                        marbleRacePlayVocals(
                          selectedCoverDocId,
                          primaryVoiceInfo.id
                        );
                      setSecondaryVoiceInfo(null);
                      setScreenName("voices-clash");
                    }}
                  />
                </Box>
              ) : showGameOverButtons ? (
                <Box
                  position={"absolute"}
                  top={0}
                  left={0}
                  width={"100%"}
                  height={"95%"}
                  display={"flex"}
                  justifyContent={"end"}
                  alignItems={"center"}
                  flexDirection={"column"}
                  pt={1}
                  zIndex={999}
                  gap={2}
                >
                  <LongImageMotionButton
                    name="Play again"
                    onClick={() => {
                      setScreenName("voices-clash");
                      setShowGameOverButtons(false);
                      setSecondaryVoiceInfo(null);
                    }}
                  />
                  <LongImageMotionButton
                    name="New Race"
                    onClick={() => {
                      setScreenName("select-track");
                      setShowGameOverButtons(false);
                      setPrimaryVoiceInfo(null);
                      setSecondaryVoiceInfo(null);
                    }}
                  />
                </Box>
              ) : screenName === "game" ? (
                <></>
              ) : (
                <Header
                  showBackButton={screenName !== "start"}
                  showCoverTitle={
                    !!selectedCoverDocId && screenName !== "select-track"
                  }
                  onBackButtonClick={() => {
                    switch (screenName) {
                      case "menu":
                        setScreenName("start");
                        break;
                      case "select-track":
                        setScreenName("menu");
                        break;
                      case "choose-primary-voice":
                        setScreenName("select-track");
                        break;
                      case "voices-clash":
                      case "game-ready":
                        if (showOpponentVoiceSelection) {
                          setShowOpponentVoiceSelection(false);
                          setSecondaryVoiceInfo(null);
                        } else {
                          setScreenName("choose-primary-voice");
                        }
                        break;
                      case "game":
                        setScreenName("voices-clash");
                        break;
                      default:
                        setScreenName("start");
                    }
                  }}
                  coverTitle={coverDoc?.title || ""}
                />
              )}
              {screenName === "start" && (
                <ScreenOne
                  onStartClick={async () => {
                    setScreenName("menu");
                    // const toneStatus = getToneStatus();
                    // if (toneStatus.isTonePlaying === false)
                    //   marbleRaceOnlyInstrument(selectedCoverDocId, 120, 0);
                  }}
                  showIosNotice={showIosNotice}
                />
              )}
              {screenName === "menu" && (
                <ScreenTwo
                  onSingleRaceClick={() => {
                    setScreenName("select-track");
                  }}
                />
              )}
              {coversSnapshot && screenName === "select-track" && (
                <SelectTrack
                  coversSnapshot={coversSnapshot}
                  selectedCoverDocId={selectedCoverDocId}
                  onTrackSelected={(
                    coverDoc: CoverV1,
                    coverId: string,
                    voiceInfo: VoiceV1Cover | null
                  ) => {
                    setCoverDoc(coverDoc);
                    setSelectedCoverDocId(coverId);
                    setPrimaryVoiceInfo(voiceInfo);
                  }}
                  onNextPageClick={() => {
                    setScreenName("choose-primary-voice");
                  }}
                />
              )}
              {coverDoc && screenName === "choose-primary-voice" && (
                <ChoosePrimaryVoice
                  selectedCoverId={selectedCoverDocId}
                  voices={coverDoc.voices}
                  primaryVoiceInfo={primaryVoiceInfo}
                  onPrimaryVoiceSelected={(voiceInfo) => {
                    setPrimaryVoiceInfo(voiceInfo);
                    // setScreenName("voices-clash");
                    setScreenName("game-ready");
                  }}
                />
              )}
              {primaryVoiceInfo &&
                coverDoc &&
                (screenName === "voices-clash" ||
                  screenName === "game-ready") && (
                  <VoicesClash
                    voices={coverDoc.voices}
                    selectedCoverDocId={selectedCoverDocId}
                    primaryVoiceInfo={primaryVoiceInfo}
                    secondaryVoiceInfo={secondaryVoiceInfo}
                    onChooseOpponent={(voiceInfo) => {
                      setSecondaryVoiceInfo(voiceInfo);
                    }}
                    onStartRaceClick={async () => {
                      await downloadVocalsAndStartGame();
                      setIsPlayingGame(true);
                      setScreenName("game");
                    }}
                    downloadProgress={downloadProgress}
                    userInfo={userInfo}
                    showOpponentVoiceSelection={showOpponentVoiceSelection}
                    setShowOpponentVoiceSelection={
                      setShowOpponentVoiceSelection
                    }
                  />
                )}
              {primaryVoiceInfo &&
                secondaryVoiceInfo &&
                screenName === "game" &&
                coverDoc && (
                  <PhaserGame
                    ref={phaserRef}
                    voices={[primaryVoiceInfo, secondaryVoiceInfo].map((v) => ({
                      id: v.id,
                      name: v.name,
                      avatar: getVoiceAvatarPath(v.id),
                    }))}
                    coverDocId={selectedCoverDocId}
                    musicStartOffset={
                      coverDoc?.sections?.at(startSectionIdx - 1)?.start || 0
                    }
                    skinPath={getSkinPath(selectedSkinPath)}
                    backgroundPath={`https://voxaudio.nusic.fm/marble_race%2Frace_bgs%2Fsunset.png?alt=media`}
                    selectedTracks={[...selectedTracksList].slice(
                      0,
                      noOfRaceTracks
                    )}
                    noOfRaceTracks={noOfRaceTracks}
                    gravityY={4}
                    width={canvasElemWidth}
                    trailPath={getTrailPath(selectedTrailPath)}
                    dpr={window.devicePixelRatio || 2}
                  />
                )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}

export default App;
