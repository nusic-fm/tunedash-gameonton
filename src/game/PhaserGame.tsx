import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import StartGame from "./main";
import { GameVoiceInfo } from "./scenes/Preloader";
import { Box } from "@mui/material";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export interface IGameDataParams {
  voices: GameVoiceInfo[];
  coverDocId: string;
  musicStartOffset: number;
  skinPath: string;
  backgroundPath: string;
  selectedTracks: string[];
  noOfRaceTracks: number;
  gravityY: number;
  width: number;
  trailPath: string;
  height?: number;
  dprAdjustedWidth?: number;
  dprAdjustedHeight?: number;
  showObstacles?: boolean;
  dpr: number;
}

interface IProps extends IGameDataParams {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
  function PhaserGame(
    {
      voices,
      coverDocId,
      musicStartOffset,
      skinPath,
      backgroundPath,
      selectedTracks,
      noOfRaceTracks,
      gravityY,
      width,
      trailPath,
      dpr,
    },
    ref
  ) {
    const height = window.innerHeight;
    const game = useRef<Phaser.Game | null>(null!);

    // useEffect(() => {
    //   if (
    //     typeof window !== "undefined" &&
    //     typeof window.devicePixelRatio !== "undefined"
    //   ) {
    //     setDpr(window.devicePixelRatio);
    //   }
    // }, [dpr]);

    useLayoutEffect(() => {
      const dprAdjustedWidth = width * dpr;
      const dprAdjustedHeight = height * dpr;

      game.current = StartGame("game-container", {
        voices,
        coverDocId,
        musicStartOffset,
        skinPath,
        backgroundPath,
        selectedTracks,
        noOfRaceTracks,
        gravityY,
        dprAdjustedWidth,
        dprAdjustedHeight,
        width,
        height,
        trailPath,
        dpr,
      });

      if (typeof ref === "function") {
        ref({ game: game.current, scene: null });
      } else if (ref) {
        ref.current = { game: game.current, scene: null };
      }

      return () => {
        if (game.current) {
          game.current.destroy(true);
          if (game.current !== null) {
            game.current = null;
          }
        }
      };
    }, [ref]);

    return (
      <Box
        id="game-container"
        sx={{
          height: "100%",
          "& canvas": {
            width,
            height,
            // border: "1px solid red",
          },
        }}
      ></Box>
    );
  }
);
