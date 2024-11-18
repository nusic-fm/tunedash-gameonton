import Phaser from "phaser";
import { IGameDataParams } from "../PhaserGame";

export type GameVoiceInfo = {
  id: string;
  name: string;
  avatar: string;
};

export default class Preloader extends Phaser.Scene {
  public params: IGameDataParams;
  constructor() {
    super("preloader");
  }

  init(data: IGameDataParams) {
    this.params = data;
  }

  preload() {
    console.log("Preloader...");
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: "Loading...",
      style: {
        font: "20px monospace",
        color: "#ffffff",
      },
    });
    loadingText.setOrigin(0.5, 0.5);
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: "0%",
      style: {
        font: "18px monospace",
        color: "#ffffff",
      },
    });
    percentText.setOrigin(0.5, 0.5);
    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: "",
      style: {
        font: "18px monospace",
        color: "#ffffff",
      },
    });
    assetText.setOrigin(0.5, 0.5);
    this.load.image("background", this.params.backgroundPath);
    this.params.voices.map((voice) => {
      this.load.image(voice.id, voice.avatar);
    });
    this.params.selectedTracks.map((trackNo) => {
      switch (trackNo) {
        case "01":
          this.load.image("prod_texture_loaded_01", "assets/sprite/01.png");
          break;
        case "03":
          this.load.image("prod_texture_loaded_03", "assets/sprite/03.png");
          break;
        case "06":
          this.load.image("prod_texture_loaded_06", "assets/sprite/06.png");
          this.load.image("06b", "assets/sprite/06b.png");
          break;
        case "07":
          this.load.image("prod_texture_loaded_07", "assets/sprite/07.png");
          break;
        case "16":
          this.load.image("prod_texture_loaded_16", "assets/sprite/16.png");
          break;
        case "21":
          this.load.image("prod_texture_loaded_21", "assets/sprite/21.png");
          break;
      }
    });

    this.load.json("prod_shapes", "assets/physics/new_shapes.json");
    // Mini
    this.load.json("mini_shapes", "assets/physics/mini_shapes.json");
    this.load.image("textureImage", this.params.skinPath);
    this.load.image("wheel", "assets/sprite/wheel.png");
    this.load.image("finish_line", "assets/finish_line.png");
    this.load.image("trail", this.params.trailPath);
    this.load.image(
      "booster_powerup",
      "assets/tunedash/rhythmicpads/booster_powerup.png"
    );
    // this.load.image(
    //     "tile_track",
    //     "assets/sprite/rhythmicpads/tile_track.png"
    // );
    this.load.image(
      "tile_finish",
      "assets/tunedash/rhythmicpads/tile_finish.png"
    );
    this.load.image("tile", "assets/tunedash/rhythmicpads/tile.png");
    this.load.image("win_result", "assets/tunedash/bgs/win_result.jpg");
    this.load.image("lose_result", "assets/tunedash/bgs/lose_result.jpg");
    this.load.audio("win_sound", "assets/tunedash/sounds/win_sound.mp3");
    this.load.audio("lose_sound", "assets/tunedash/sounds/lose_sound.mp3");
    this.load.on("progress", function (value: number) {
      console.log(value);
      percentText.setText(parseInt(`${value * 100}`) + "%");
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on("fileprogress", function (file: any) {
      console.log(file.src);
      assetText.setText("Loading asset: " + file.key);
    });
    this.load.once("complete", () => {
      console.log("Preloader complete");
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
  }

  create() {
    // this.input.on(
    //     "wheel",
    //     (
    //         pointer: any,
    //         gameObjects: any,
    //         deltaX: any,
    //         deltaY: any,
    //         deltaZ: any
    //     ) => {
    //         this.cameras.main.scrollY += deltaY * 0.5; // Adjust the scroll speed
    //     }
    // );

    console.log("Starting game");
    this.scene.start("game", this.params);
  }
}
