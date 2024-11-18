import Phaser from "phaser";
import {
  getToneCurrentTime,
  //   marbleRaceOnlyInstrument,
  marbleRacePlayVocals,
} from "../../hooks/useTonejs";
import _ from "lodash";
import { GameVoiceInfo } from "./Preloader";
import { BodyType } from "matter";
import {
  duplicateArrayElemToN,
  getBeatsArray,
  createRandomNumber,
} from "../../helpers";
import { EventBus } from "../EventBus";
import { IGameDataParams } from "../PhaserGame";

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
    this.throttledUpdate = _.throttle(this.throttledUpdate.bind(this), 10); // Throttle interval in milliseconds
  }
  public sky: Phaser.Physics.Matter.Image | undefined;
  public marbles: MatterJS.BodyType[] = [];
  public marblesImages: Phaser.GameObjects.Image[] = [];
  public marblesMasks: Phaser.GameObjects.Graphics[] = [];
  public isInstrumentPlaying: boolean = false;
  public autoScroll = true;
  public prevVoiceIdx = -1;
  public leftRotatableStars: Phaser.Physics.Matter.Sprite[] = [];
  public rightRotatableStars: Phaser.Physics.Matter.Sprite[] = [];
  public reduceSizeScreenOffset: number[] = [];
  public increaseSizeScreenOffset: number[] = [];
  public currentMarblesSizeIndices: { [key: string]: number } = {};
  public heightReducedIndices: number[] = [];
  public upDownMotionElems: {
    matter: Phaser.Physics.Matter.Image;
    startX: number;
    startY: number;
    maxTop: number;
    maxBottom: number;
    moveSpeed: number;
    direction: "left" | "right";
  }[] = [];
  public labels: Phaser.GameObjects.Text[] = [];
  public motionTimeForUpDownWard = 0;
  public crossRightRotation: Phaser.Physics.Matter.Sprite[] = [];
  public crossLeftRotation: Phaser.Physics.Matter.Sprite[] = [];
  public horizontalCrossRightRotation: Phaser.Physics.Matter.Sprite[] = [];
  public horizontalCrossLeftRotation: Phaser.Physics.Matter.Sprite[] = [];
  // public trails: { x: number; y: number }[][] = [];
  // public trailGraphics: Phaser.GameObjects.Graphics[] = [];
  // public trailsGroup: Phaser.GameObjects.Group[] = [];
  public trailLength: number = 0;
  public trailPoints: {
    x: number;
    y: number;
    angle: number;
    // size: number;
  }[][] = [];
  // public shape: any;
  public voices: GameVoiceInfo[] = [];
  public coverDocId: string = "";
  public musicStartOffset: number = 0;
  public selectedTracks: string[] = [];
  public noOfRaceTracks: number = 0;
  largeCircle: Phaser.Physics.Matter.Image | undefined;
  isRotating = true;
  baseAngle = 0;
  centerX = 0;
  centerY = 0;
  radius = 100;
  angleIncrement = (2 * Math.PI) / 5;
  countdownText: Phaser.GameObjects.Text | undefined;
  finishLineOffset: number = 0;
  marbleRadius = 23;
  background: Phaser.GameObjects.TileSprite | undefined;
  enableMotion: boolean = false;
  marbleTrailParticles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  isGameOver: boolean = false;
  winnerIdx: number = -1;
  isResultShown = false;
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  dpr: number = 2;
  trailConfig = {
    speed: { min: -50, max: 50 },
    scale: {
      start: this.dpr,
      end: this.dpr * 0.5,
    },
    blendMode: "ADD",
    lifespan: 400,
    alpha: 0.5,
  };
  showObstacles: boolean = false;
  initialGravity: number = 0;
  userMarbleIdx: number = 0;
  tapTimings: number[] = [];
  allTapTimings: number[] = [];
  circleShouldFillInMs = 1500;
  beatsGroupLength = 8;
  resultLabel: Phaser.GameObjects.Text | undefined;
  tapScore: number = 0;
  isBoosted = false;
  isOpponentBoosted = false;
  opponentBoostMultipler = 0;
  opponentMarbleIdx = 1;
  finishTap: Phaser.GameObjects.Image | undefined;
  boostMultipler: number = 0;
  tapResultLabel: Phaser.GameObjects.Text | undefined;
  tapResultLabelTimer: ReturnType<typeof setTimeout> | undefined;
  showRhythmPads: boolean = false;
  powerups: Phaser.Physics.Matter.Image[] = [];
  particleIntialTint: number = 0xffffff;
  userMarbleMaxSpeed = 0;
  opponentMarbleMaxSpeed = 0;
  tiles: Phaser.GameObjects.Image[] = [];

  init(data: IGameDataParams) {
    // Sort the voices randomly
    this.voices = data.voices;
    // .sort(() => Math.random() - 0.5);
    this.coverDocId = data.coverDocId;
    const musicOffset = getToneCurrentTime();
    this.musicStartOffset = musicOffset;
    this.allTapTimings = getBeatsArray(this.coverDocId, this.musicStartOffset);
    this.noOfRaceTracks = data.noOfRaceTracks || 5;
    this.selectedTracks = duplicateArrayElemToN(
      data.selectedTracks,
      this.noOfRaceTracks
    );
    this.canvasWidth = data.width;
    this.dpr = data.dpr || 2;
    this.trailConfig = {
      speed: { min: -50, max: 50 },
      scale: {
        start: this.dpr,
        end: this.dpr * 0.5,
      },
      blendMode: "ADD",
      lifespan: 400,
      alpha: 0.5,
    };
    this.marbleRadius = (22 / 414) * this.canvasWidth * this.dpr;
    if (data.height) this.canvasHeight = data.height;
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height / 2;
    this.showObstacles = data.showObstacles || false;
    this.initialGravity = data.gravityY || 0;
  }

  throttledUpdate(index: number, switchOld: boolean = true) {
    this.prevVoiceIdx = index;
    // Logic that should be throttled
    marbleRacePlayVocals(this.coverDocId, this.voices[index].id);
  }

  createTextureMask = (
    xOffset: number,
    yOffset: number,
    baseSprite: Phaser.Physics.Matter.Sprite | Phaser.Physics.Matter.Image
  ) => {
    // Create the texture sprite
    const textureSprite = this.add.sprite(xOffset, yOffset, "textureImage");
    textureSprite.setScale(this.dpr);

    // Use the base sprite's texture as a mask for the texture sprite
    const mask = new Phaser.Display.Masks.BitmapMask(this, baseSprite);
    textureSprite.setMask(mask);

    // Optionally, hide the base sprite if you only want to show the texture
    baseSprite.setVisible(false);
  };

  createSeesawScreen = (
    xOffset: number,
    startOffset: number,
    prodShapes: any,
    miniShapes: any
  ) => {
    const baseSprite = this.matter.add
      .sprite(xOffset, startOffset, "prod_texture_loaded_06", undefined, {
        shape: prodShapes["06"],
        isStatic: true,
      })
      .setScale(this.dpr * (this.canvasWidth / (512 - 100)));
    const yOffset = startOffset + baseSprite.height / 2;
    baseSprite.setPosition(xOffset, yOffset);
    const seesawX = xOffset - 2;
    // 132 for 414 width
    // 110 for 344 width
    // FOrumula (132/414)*width + 30
    const seesawContraintY = -(132 / 414) * this.canvasWidth;
    const seesawY = yOffset + seesawContraintY;
    const seesaw = this.matter.add
      .sprite(seesawX, seesawY, "06b", undefined, {
        shape: miniShapes["06b"],
        // isStatic: true,
      })
      .setScale(this.dpr);
    const contraint = this.matter.constraint.create({
      bodyA: seesaw.body as BodyType,
      bodyB: baseSprite.body as BodyType,
      pointA: { x: 0, y: 0 },
      pointB: {
        x: -2,
        y: seesawContraintY * this.dpr,
      },
      stiffness: 1,
      length: 0,
    });
    this.matter.world.add(contraint);
    this.createTextureMask(seesawX, seesawY, seesaw);
    this.createTextureMask(xOffset, yOffset, baseSprite);
    return startOffset + baseSprite.height * this.dpr;
  };
  createCircleBlockers = (
    xOffset: number,
    startOffset: number,
    prodShapes: any
  ) => {
    const yOffset = startOffset + 833 / 2;
    const baseSprite = this.matter.add
      .sprite(xOffset, yOffset, "prod_texture_loaded_21", undefined, {
        shape: prodShapes["21"],
        isStatic: true,
      })
      .setScale(this.dpr * (this.canvasWidth / (512 - 100)));
    this.createTextureMask(xOffset, yOffset, baseSprite);
    return startOffset + baseSprite.height * this.dpr;
  };

  createStaticTriangles = (
    xOffset: number,
    startOffset: number,
    prodShapes: any
  ) => {
    const yOffset = startOffset + 833 / 2;
    const baseSprite = this.matter.add
      .sprite(xOffset, yOffset, "prod_texture_loaded_03", undefined, {
        shape: prodShapes["03"],
        isStatic: true,
      })
      .setScale(this.dpr * (this.canvasWidth / (512 - 100)));
    this.createTextureMask(xOffset, yOffset, baseSprite);
    [
      [100 * this.dpr, startOffset + 260 * this.dpr],
      [(this.canvasWidth / 414) * 310 * this.dpr, startOffset + 260 * this.dpr],
    ].map(([x, y]) => {
      this.powerups.push(
        this.matter.add
          .image(x, y, "booster_powerup", undefined, {
            isStatic: true,
          })
          .setScale(this.dpr)
          .setSensor(true)
      );
    });
    return startOffset + baseSprite.height * this.dpr;
  };

  createReduceSizeSlider = (
    xOffset: number,
    startOffset: number,
    prodShapes: any
  ) => {
    this.reduceSizeScreenOffset.push(startOffset - 400);
    const yOffset = startOffset + 833 / 2;
    const baseSprite = this.matter.add
      .sprite(xOffset + 3.5, yOffset, "prod_texture_loaded_16", undefined, {
        shape: prodShapes["16"],
        isStatic: true,
      })
      .setScale(this.dpr * (this.canvasWidth / (512 - 100)));
    // Increase the strength of the base sprite
    baseSprite.setMass(1000);
    this.createTextureMask(xOffset, yOffset, baseSprite);
    startOffset += baseSprite.height * this.dpr;
    this.increaseSizeScreenOffset.push(startOffset);
    startOffset += 300;
    return startOffset;
  };
  createStaticCircles = (
    xOffset: number,
    startOffset: number,
    prodShapes: any
  ) => {
    const baseSprite = this.matter.add
      .sprite(xOffset, startOffset, "prod_texture_loaded_01", undefined, {
        shape: prodShapes["01"],
        isStatic: true,
      })
      .setScale(this.dpr * (this.canvasWidth / (512 - 100)));
    const yOffset = startOffset + baseSprite.height / 2;
    baseSprite.setPosition(baseSprite.x, yOffset);
    this.createTextureMask(xOffset, yOffset, baseSprite);
    // Show Powerups
    [
      [100 * this.dpr, startOffset + 350 * this.dpr],
      [(this.canvasWidth / 414) * 310 * this.dpr, startOffset + 260 * this.dpr],
    ].map(([x, y]) => {
      this.powerups.push(
        this.matter.add
          .image(x, y, "booster_powerup", undefined, {
            isStatic: true,
          })
          .setScale(this.dpr)
          .setSensor(true)
      );
    });
    return startOffset + baseSprite.height * this.dpr;
  };
  createZigzagSlider = (
    xOffset: number,
    startOffset: number,
    prodShapes: any
  ) => {
    const baseSprite = this.matter.add.sprite(
      xOffset,
      startOffset,
      "prod_texture_loaded_07",
      undefined,
      {
        shape: prodShapes["07"],
        isStatic: true,
      }
    );
    baseSprite.setPosition(baseSprite.x, startOffset + baseSprite.height / 2);
    baseSprite.setScale(this.dpr * (this.canvasWidth / (512 - 100)));
    this.createTextureMask(
      xOffset,
      startOffset + baseSprite.height / 2,
      baseSprite
    );
    const left: [number, number] = _.sample([
      [this.centerX - 360, startOffset],
      [this.centerX - 360, startOffset + 450],
      // [this.centerX - 360, startOffset + 900],
    ]);
    const right: [number, number] = _.sample([
      [this.centerX + 360, startOffset],
      [this.centerX + 360, startOffset + 450],
      // [this.centerX + 360, startOffset + 900],
    ]);
    [left, right].map(([x, y]) => {
      this.powerups.push(
        this.matter.add
          .image(x, y, "booster_powerup", undefined, {
            isStatic: true,
          })
          .setScale(this.dpr)
          .setSensor(true)
      );
    });
    return startOffset + baseSprite.height * this.dpr;
  };
  createMarbles = (marbleRadius: number, miniShapes: any) => {
    this.largeCircle = this.matter.add.sprite(
      this.centerX,
      this.centerY - 100,
      "wheel",
      undefined,
      {
        shape: miniShapes["wheel"],
        isStatic: true,
        frictionStatic: 1,
        friction: 1,
      }
    );
    // For Testing
    // this.largeCircle.setScale(0.1);
    // this.isRotating = false;
    this.largeCircle.setScale(
      (this.canvasWidth / this.largeCircle.width) * this.dpr
    );
    const xOffsetValues = [
      this.centerX - 46,
      this.centerX + 23,
      this.centerX,
      this.centerX + 23,
      this.centerX + 46,
    ];
    this.voices.map((v, i) => {
      this.currentMarblesSizeIndices[i.toString()] = 0;
      // const angle = i * this.angleIncrement;
      // const x = this.centerX + this.radius * Math.cos(angle);
      // const y = this.centerY + this.radius * Math.sin(angle);
      const circleBody = this.matter.add.circle(
        xOffsetValues[i],
        this.centerY,
        marbleRadius,
        {
          restitution: 0.4,
          // density: 0.02,
          friction: 0,
          frictionAir: 0,
          frictionStatic: 0,
          label: v.id,
        }
      );
      this.marbles.push(circleBody);
      this.marbleTrailParticles.push(
        this.add.particles(0, 0, "trail", {
          ...this.trailConfig,
          follow: circleBody.position,
        })
      );

      // circleBody.emitter = emitter;
      // this.trailsGroup.push(this.add.group());
      // this.trailGraphics.push(this.add.graphics());
      // this.trailPoints.push([]);
      // // Create an image and attach it to the circle body
      const circleImage = this.add
        .image(circleBody.position.x, circleBody.position.y, v.id)
        .setDepth(1);
      circleImage.setDisplaySize(marbleRadius * 2, marbleRadius * 2);
      circleImage.setOrigin(0.5, 0.5);
      // Circle mask
      const maskShape = this.make.graphics();
      maskShape.fillStyle(0xffffff);
      maskShape.fillCircle(marbleRadius, marbleRadius, marbleRadius);
      const mask = maskShape.createGeometryMask();

      // Apply the mask to the image
      circleImage.setMask(mask);
      this.marblesMasks.push(maskShape);

      this.marblesImages.push(circleImage);
      // Create label for each circle
      let label = this.add.text(
        circleImage.x,
        circleImage.y - 560,
        this.voices[i].name,
        {
          fontSize: "32px",
          color: "#ffffff",
          stroke: "#000",
          strokeThickness: 4,
        }
      );
      label.setDepth(1);
      this.labels.push(label);
    });
    this.particleIntialTint = this.marbleTrailParticles[this.userMarbleIdx]
      .particleTint as number;
    this.countdownText = this.add
      .text(this.centerX, this.centerY - 100, "3", {
        fontSize: `${64 * this.dpr}px`,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    if (this.powerups.length) {
      this.powerups.map((powerup) => {
        powerup.setOnCollideWith(this.marbles, (e: any) => {
          if (this.showRhythmPads) return;
          if (e.label === this.marbles[this.opponentMarbleIdx].label) {
            this.isOpponentBoosted = true;
            this.opponentMarbleMaxSpeed =
              this.marbles[this.opponentMarbleIdx].velocity.y +
              createRandomNumber(10, 20);
            this.opponentBoostMultipler =
              this.marbles[this.opponentMarbleIdx].velocity.y;
            this.marbleTrailParticles[this.opponentMarbleIdx].setParticleTint(
              0xf83600
            );
            powerup.destroy();
          } else if (e.label === this.marbles[this.userMarbleIdx].label) {
            this.powerups.map((p) => (p.visible = false));
            this.startRhythmicGame();
            powerup.destroy();
          }
        });
      });
    }
  };
  showResult() {
    this.finishTap?.destroy();
    this.tapResultLabel?.destroy();
    this.showRhythmPads = false;
    this.tiles.map((t) => t.destroy());
    const isWin = this.winnerIdx === 0;
    let resultImage;
    let xpText: Phaser.GameObjects.Text | undefined;
    if (isWin) {
      resultImage = this.add
        .image(this.centerX, this.centerY, "win_result")
        .setDisplaySize(
          this.cameras.main.width / this.dpr,
          this.cameras.main.height / this.dpr
        )
        .setDepth(100000)
        // .setScale(this.dpr)
        .setScrollFactor(0);
      xpText = this.add
        .text(this.centerX, 60 * this.dpr, "+500XP", {
          fontSize: `${52 * this.dpr}px`,
          color: "#573FC8",
          stroke: "#fff",
          strokeThickness: 4,
        })
        .setVisible(false)
        .setDepth(1000001)
        .setScrollFactor(0);
      xpText.setPosition(
        xpText.x - xpText.width / 2,
        xpText.y - xpText.height / 2
      );
      this.sound.play("win_sound");
    } else {
      resultImage = this.add
        .image(this.centerX, this.centerY, "lose_result")
        .setDisplaySize(
          this.cameras.main.width / this.dpr,
          this.cameras.main.height / this.dpr
        )
        .setDepth(100000)
        // .setScale(this.dpr)
        .setScrollFactor(0);
      this.sound.play("lose_sound");
    }
    // Add tween to scale the result image from 0 to 1
    this.tweens.add({
      targets: resultImage,
      scale: this.dpr * 0.9,
      duration: 500,
      ease: "Bounce.out",
      onStart: () => {
        xpText?.setVisible(true);
      },
    });
    // const labelContent = isWin ? "You Win!" : "You Lose";
    // // const xpContent = this.winnerIdx === 1 ? "+500 XP" : "+0 XP";

    // const label = this.add
    //   .text(this.centerX, this.centerY - 180, labelContent, {
    //     fontSize: `${64 * this.dpr}px`,
    //     color: "#ffffff",
    //     stroke: "#000",
    //     strokeThickness: 4,
    //   })
    //   .setScrollFactor(0);
    // label.setDepth(1);
    // label.setPosition(label.x - label.width / 2, label.y - label.height / 2);
    // const labelXp = this.add
    //   .text(this.centerX, this.centerY + 250, xpContent, {
    //     fontSize: `${52 * this.dpr}px`,
    //     color: "#573FC8",
    //     stroke: "#fff",
    //     strokeThickness: 4,
    //   })
    //   .setScrollFactor(0);
    // // .setScale(this.dpr);
    // labelXp.setDepth(1);
    // labelXp.setPosition(
    //   labelXp.x - labelXp.width / 2,
    //   labelXp.y - labelXp.height / 2
    // );
    EventBus.emit(
      "game-over",
      this.winnerIdx === this.userMarbleIdx,
      this.voices,
      this.voices[this.userMarbleIdx].id
    );
    this.isResultShown = true;
  }

  startRhythmicGame() {
    const currentTime = getToneCurrentTime();
    const targetY = this.centerY * 1.5;
    this.showRhythmPads = true;
    const travelBufferTime = this.circleShouldFillInMs / 1000;
    const availableBeats = this.allTapTimings.filter(
      (t) => t > currentTime + travelBufferTime
    );
    const nextSetOfBeats = [];
    let beatIndex = 0;
    for (let i = 0; i < this.beatsGroupLength; i++) {
      nextSetOfBeats.push(availableBeats[beatIndex]);
      beatIndex += createRandomNumber(1, 3);
    }
    const animationStartTimes = nextSetOfBeats.map(
      (bt) => bt - travelBufferTime
    );
    this.finishTap = this.add
      .sprite(this.centerX, targetY, "tile_finish")
      .setScrollFactor(0)
      .setDepth(99)
      .setScale(this.dpr)
      .setVisible(false);

    this.time.addEvent({
      delay: (animationStartTimes[0] - currentTime) * 1000,
      callback: () => {
        this.finishTap?.setVisible(true);
      },
    });
    // const finishTapWidth = this.finishTap?.width ?? 403;
    // if 125 is for 344
    // then what is it for 344 * this.dpr?
    // answer: 125 * this.dpr

    const leftOffset = this.centerX - 125 * this.dpr;
    const righOffset = this.centerX + 125 * this.dpr;
    animationStartTimes.map((startTime) => {
      const currentX = _.sample([leftOffset, righOffset]);
      const tile = this.add
        .sprite(currentX, 0, "tile")
        .setDepth(101)
        .setScrollFactor(0)
        .setScale(this.dpr)
        .setInteractive()
        .setVisible(false);
      this.tiles.push(tile);
      const tileTrail = this.add
        .particles(0, 0, "tile", {
          speedY: 80,
          lifespan: 500,
          scale: {
            start: this.dpr,
            end: this.dpr * 0.8,
          },
          alpha: { start: 0.05, end: 0 },
          follow: tile,
          visible: false,
        })
        .setDepth(100)
        .setScrollFactor(0);
      tile.once("pointerdown", () => {
        const tileY = tile.y;
        const delta = targetY - tileY;
        const resultText =
          delta < 150 ? "Perfect" : delta < 500 ? "Great" : "Too Early";
        this.tapScore +=
          resultText === "Perfect" ? 10 : resultText === "Great" ? 5 : 0;
        tile.destroy();
        tileTrail.destroy();
        if (this.tapResultLabelTimer) {
          clearTimeout(this.tapResultLabelTimer);
        }
        this.tapResultLabel?.destroy();
        this.tapResultLabel = this.add
          .text(this.centerX, targetY + 100, resultText.toUpperCase(), {
            fontSize: `${28 * this.dpr}px`,
            color:
              resultText === "Perfect"
                ? "green"
                : resultText === "Great"
                ? "yellow"
                : "red",
            stroke: "rgba(0,0,0,1)",
            strokeThickness: 6,
          })
          .setDepth(101)
          .setScrollFactor(0);
        this.tapResultLabel?.setPosition(
          this.tapResultLabel.x - this.tapResultLabel.width / 2,
          this.tapResultLabel.y - this.tapResultLabel.height / 2
        );
        // Add bounce using tween
        this.tweens.add({
          targets: this.tapResultLabel,
          y: this.tapResultLabel.y - 100,
          duration: 100,
          ease: "bounce.out",
          // Add glow effect
          glow: {
            color: 0xffffff,
            intensity: 0.5,
          },
        });

        // Destroy the label after 1 second
        this.tapResultLabelTimer = setTimeout(() => {
          this.tapResultLabel?.destroy();
        }, 500);
      });
      const tween = this.tweens.add({
        targets: tile,
        y: targetY + tile.height * this.dpr,
        duration: this.circleShouldFillInMs,
        delay: (startTime - currentTime) * 1000,
        ease: "Linear",
        onComplete: () => {
          tile.destroy();
          this.tweens.remove(tween);
          tileTrail.destroy();
        },
        onStart: () => {
          tile.setVisible(true);
          tileTrail.setVisible(true);
        },
      });
    });
    // Hide the game after the last tile has been tapped
    this.time.addEvent({
      delay:
        (animationStartTimes[animationStartTimes.length - 1] +
          this.circleShouldFillInMs / 1000 -
          currentTime) *
        1000,
      callback: () => {
        this.finishTap?.setVisible(false);
        this.showRhythmPads = false;
        this.powerups.map((p) => (p.visible = true));
        // Start the booster after the completion of the rhythmic game
        if (this.tapScore) {
          const currentSpeed = this.marbles[this.userMarbleIdx].velocity.y;
          this.boostMultipler = currentSpeed;
          const addedSpeed = (this.tapScore / 80) * 25;
          this.userMarbleMaxSpeed = currentSpeed + addedSpeed;
          this.isBoosted = true;
          this.marbleTrailParticles[this.userMarbleIdx].setParticleTint(
            0xf83600
          );
          this.tapResultLabel?.destroy();
          this.tapResultLabel = this.add
            .text(
              this.cameras.main.width / 2,
              this.cameras.main.height / 2,
              "Boosted",
              {
                fontSize: `${42 * this.dpr}px`,
                color: "white",
                stroke: "rgba(0,0,0,1)",
                strokeThickness: 6,
                // backgroundColor: "rgba(0,0,0,1)",
              }
            )
            .setScrollFactor(0);
          this.tapResultLabel?.setPosition(
            this.tapResultLabel.x - this.tapResultLabel.width / 2,
            this.tapResultLabel.y - this.tapResultLabel.height / 2
          );
          if (this.tapResultLabelTimer) {
            clearTimeout(this.tapResultLabelTimer);
          }
          this.tapResultLabelTimer = setTimeout(() => {
            // this.matter.world.setGravity(0, this.initialGravity);
            this.tapResultLabel?.destroy();
          }, 2000);
        }
      },
    });
  }

  create() {
    console.log("Game Scene...");
    this.sound.add("win_sound", { loop: false, volume: 0.8 });
    this.sound.add("lose_sound", { loop: false, volume: 0.8 });
    // Center the background image
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const bg = this.add
      .image(centerX, centerY, "background")
      .setScrollFactor(0);
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    var prodShapes = this.cache.json.get("prod_shapes");
    var miniShapes = this.cache.json.get("mini_shapes");

    let startOffset = this.centerY * 2;
    const xOffset = this.centerX;
    // this.selectedTracks = ["06", "07", "03", "01", "16"];
    this.selectedTracks.map((trackNo) => {
      switch (trackNo) {
        case "01":
          startOffset = this.createStaticCircles(
            xOffset,
            startOffset,
            prodShapes
          );
          break;
        case "03":
          startOffset = this.createStaticTriangles(
            xOffset,
            startOffset,
            prodShapes
          );
          break;
        case "06":
          startOffset = this.createSeesawScreen(
            xOffset,
            startOffset,
            prodShapes,
            miniShapes
          );
          break;
        case "07":
          startOffset = this.createZigzagSlider(
            xOffset,
            startOffset,
            prodShapes
          );
          break;
        case "16":
          startOffset = this.createReduceSizeSlider(
            xOffset,
            startOffset,
            prodShapes
          );
          break;
        case "21":
          startOffset = this.createCircleBlockers(
            xOffset,
            startOffset,
            prodShapes
          );
          break;
      }
    });
    const finishOffset = startOffset + 250;
    this.add.image(centerX, finishOffset, "finish_line").setScale(0.6);
    this.finishLineOffset = finishOffset;
    // .setDisplaySize(960, 40);
    this.cameras.main.setBounds(
      0,
      0,
      this.cameras.main.width,
      finishOffset + 250
    );
    this.matter.world.setBounds(
      0,
      0,
      this.cameras.main.width,
      finishOffset + 800
    );

    this.createMarbles(this.marbleRadius, miniShapes);
    this.crossLeftRotation.map((baseSprite) =>
      this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
    );
    this.crossRightRotation.map((baseSprite) =>
      this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
    );
    [...this.leftRotatableStars, ...this.rightRotatableStars].map(
      (baseSprite) =>
        this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
    );
    [
      ...this.horizontalCrossLeftRotation,
      ...this.horizontalCrossRightRotation,
    ].map((baseSprite) =>
      this.createTextureMask(baseSprite.x, baseSprite.y, baseSprite)
    );

    let coundownValue = 3;
    // Start Countdown:
    const clock = this.time.addEvent({
      delay: 500,
      repeat: 2,
      callback: () => {
        if (this.countdownText) {
          coundownValue--;
          if (coundownValue > 0) {
            this.countdownText.setText(coundownValue.toString());
          } else {
            this.countdownText.setText("Go!");
            console.log("Go!");
            // remove the large circle
            if (this.largeCircle?.body) {
              this.matter.world.remove(this.largeCircle.body, true);
              this.largeCircle.destroy();
              //     this.matter.world.remove(this.largeCircle);
            }
            this.isRotating = false;
            this.countdownText.destroy();
            clock.destroy();
            this.cameras.main.startFollow(
              this.marblesImages[this.userMarbleIdx]
            );
          }
        }
      },
    });
    // marbleRaceOnlyInstrument(this.coverDocId, 120, this.musicStartOffset).then(
    //   () => (this.isInstrumentPlaying = true)
    // );
    this.isInstrumentPlaying = true;
    // if (this.showRythmicPads) this.renderJoystickButtons();
  }
  // update(time: number, delta: number): void {
  update(): void {
    // if (this.tapScore >= 60) {
    //   this.tapScore = 0;
    //   this.isBoosted = true;
    //   this.userMarbleMaxSpeed =
    //     this.marbles[this.userMarbleIdx].velocity.y + 20;
    //   this.boostMultipler = this.marbles[this.userMarbleIdx].velocity.y;
    //   this.marbleTrailParticles[this.userMarbleIdx].setParticleTint(0xf83600);
    //   this.tapResultLabel?.destroy();
    //   this.tapResultLabel = this.add
    //     .text(
    //       this.cameras.main.width / 2,
    //       this.cameras.main.height / 2,
    //       "Boosted",
    //       {
    //         fontSize: `${42 * this.dpr}px`,
    //         color: "white",
    //         stroke: "rgba(0,0,0,1)",
    //         strokeThickness: 6,
    //         // backgroundColor: "rgba(0,0,0,1)",
    //       }
    //     )
    //     .setScrollFactor(0);
    //   this.tapResultLabel?.setPosition(
    //     this.tapResultLabel.x - this.tapResultLabel.width / 2,
    //     this.tapResultLabel.y - this.tapResultLabel.height / 2
    //   );
    //   if (this.tapResultLabelTimer) {
    //     clearTimeout(this.tapResultLabelTimer);
    //   }
    //   this.tapResultLabelTimer = setTimeout(() => {
    //     // this.matter.world.setGravity(0, this.initialGravity);
    //     this.tapResultLabel?.destroy();
    //   }, 2000);
    // }
    if (this.isBoosted && this.boostMultipler < this.userMarbleMaxSpeed) {
      const userMarble = this.marbles[this.userMarbleIdx]; // TODO: User chosen marble
      this.matter.body.setVelocity(userMarble, {
        x: userMarble.velocity.x,
        y: this.boostMultipler,
      });
      this.boostMultipler += 0.1;
      if (this.boostMultipler >= this.userMarbleMaxSpeed) {
        this.marbleTrailParticles[this.userMarbleIdx].setParticleTint(
          this.particleIntialTint
        ); // white
        this.isBoosted = false;
      }
    }
    if (
      this.isOpponentBoosted &&
      this.opponentBoostMultipler < this.opponentMarbleMaxSpeed
    ) {
      const opponentMarble = this.marbles[this.opponentMarbleIdx];
      this.matter.body.setVelocity(opponentMarble, {
        x: opponentMarble.velocity.x,
        y: this.opponentBoostMultipler,
      });
      this.opponentBoostMultipler += 0.1;
      if (this.opponentBoostMultipler >= this.opponentMarbleMaxSpeed) {
        this.marbleTrailParticles[this.opponentMarbleIdx].setParticleTint(
          this.particleIntialTint
        ); // white
        this.isOpponentBoosted = false;
      }
    }

    if (this.isGameOver && this.isResultShown === false) {
      // if (this.isResultShown) return;
      this.showResult();
    }
    // if (this.enableMotion && !this.isRotating)
    //     this.background.tilePositionX += 0.08;
    if (this.marbles.length) {
      if (this.isRotating) {
        // Update the base angle to create the circular motion
        this.baseAngle += 0.01; // Adjust this value to change the speed of rotation
        this.largeCircle?.setRotation(this.baseAngle);
        this.matter.body.setAngularVelocity(
          this.largeCircle?.body as BodyType,
          0.15
        );
      }
      // Optimize marble updates
      for (let i = 0; i < this.marbles.length; i++) {
        const voiceBody = this.marbles[i];
        const marbleImage = this.marblesImages[i];
        const marbleMask = this.marblesMasks[i];
        const label = this.labels[i];
        const currentCrossIndex = this.currentMarblesSizeIndices[i.toString()];

        // Update marble image position and rotation
        if (marbleImage) {
          marbleImage.setPosition(voiceBody.position.x, voiceBody.position.y);
          marbleImage.setRotation(voiceBody.angle);
        }

        // Update marble mask position
        if (marbleMask) {
          marbleMask.setPosition(
            voiceBody.position.x - voiceBody.circleRadius,
            voiceBody.position.y - voiceBody.circleRadius
          );
        }

        // Update label position
        if (label) {
          label.setPosition(
            voiceBody.position.x - label.width / 2,
            voiceBody.position.y - 60
          );
        }

        // Check for size changes
        const isHeightReduced = this.heightReducedIndices.includes(i);
        const y = voiceBody.position.y;

        if (
          isHeightReduced &&
          y > this.increaseSizeScreenOffset[currentCrossIndex]
        ) {
          // Increase size
          this.currentMarblesSizeIndices[i.toString()]++;
          this.matter.body.scale(voiceBody, 2, 2);
          if (marbleImage)
            marbleImage.setDisplaySize(
              this.marbleRadius * 2,
              this.marbleRadius * 2
            );
          if (marbleMask) marbleMask.scale = 1;
          this.heightReducedIndices = this.heightReducedIndices.filter(
            (idx) => idx !== i
          );
          this.marbleTrailParticles[i].setConfig({
            ...this.marbleTrailParticles[i].config,
            scale: { start: this.dpr, end: this.dpr * 0.5 },
          });
        } else if (
          !isHeightReduced &&
          y > this.reduceSizeScreenOffset[currentCrossIndex] &&
          y < this.increaseSizeScreenOffset[currentCrossIndex]
        ) {
          // Reduce size
          this.heightReducedIndices.push(i);
          this.matter.body.scale(voiceBody, 0.5, 0.5);
          if (marbleImage)
            marbleImage.setDisplaySize(this.marbleRadius, this.marbleRadius);
          if (marbleMask) marbleMask.scale = 0.5;
          this.marbleTrailParticles[i].setConfig({
            ...this.marbleTrailParticles[i].config,
            scale: { start: this.dpr * 0.5, end: this.dpr * 0.01 },
          });
        }
      }
      // TODO: Optimized Code
      // this.crossRightRotation.map((c) => {
      //     c.setAngle(c.angle + 2);
      //     this.matter.body.setAngularVelocity(c.body as BodyType, 0.05);
      // });
      // this.crossLeftRotation.map((c) => {
      //     c.setAngle(c.angle - 2);
      //     this.matter.body.setAngularVelocity(c.body as BodyType, 0.05);
      // });
      if (this.isInstrumentPlaying && this.isRotating === false) {
        /*
        let largest = -Infinity;
        let secondLargest = -Infinity;
        let largestIndex = -1;
        let finishedPositions = [];
        let voicesPositions = [];

        for (let i = 0; i < this.marbles.length; i++) {
          const y = this.marbles[i].position.y;
          voicesPositions.push(y);
          if (y < this.finishLineOffset) {
            finishedPositions.push(y);
            if (y > largest) {
              secondLargest = largest;
              largest = y;
              largestIndex = i;
            } else if (y > secondLargest) {
              secondLargest = y;
            }
          }
        }
        */
        const unFinishedPositions = [];
        const finishedPositions = [];
        const voicesPositions = [];
        for (let i = 0; i < this.marbles.length; i++) {
          const y = this.marbles[i].position.y;
          voicesPositions.push(y);
          if (y < this.finishLineOffset) {
            unFinishedPositions.push(y);
          } else if (y > this.finishLineOffset) {
            finishedPositions.push(y);
          }
        }
        // Above is the refactored code
        // const voicesPositions = this.marbles.map((m) => m.position.y);
        // const unFinishedPositions = voicesPositions.filter(
        //   (y) => y < this.finishLineOffset
        // );
        // const finishedPositions = voicesPositions.filter(
        //   (y) => y > this.finishLineOffset
        // );

        if (this.winnerIdx === -1 && finishedPositions.length) {
          this.winnerIdx = voicesPositions.indexOf(finishedPositions[0]);
        }
        if (this.winnerIdx === this.userMarbleIdx) {
          this.isGameOver = true;
          return;
        }
        const largest = Math.max(...unFinishedPositions);
        const largestIndex = voicesPositions.findIndex((v) => v === largest);
        const secondLargest = Math.max(
          ...unFinishedPositions.filter((p) => p !== largest)
        );
        if (largestIndex === -1) {
          this.isGameOver = true;
          return;
        }
        if (
          this.prevVoiceIdx !== largestIndex &&
          largest > secondLargest + this.marbleRadius
        )
          this.throttledUpdate(largestIndex);
        // else if (secondLargest >= largest - this.marbleRadius * 2)
        //   this.throttledUpdate(secondLargestIndex, false);
        if (this.autoScroll) {
          // this.cameras.main.startFollow(this.marblesImages[0]);
          // this.cameras.main.scrollY = largest - 300 * this.dpr;
        }
      }

      // Optimised Code
      // let largest = -Infinity;
      // let secondLargest = -Infinity;
      // let index = -1;

      // for (let i = 0; i < this.marbles.length; i++) {
      //     const y = this.marbles[i].position.y;
      //     if (y < this.finishLineOffset) {
      //         if (y > largest) {
      //             secondLargest = largest;
      //             largest = y;
      //             index = i;
      //         } else if (y > secondLargest) {
      //             secondLargest = y;
      //         }
      //     }
      // }
      // TODO: Uncomment this
      // this.leftRotatableStars.map((rs) => rs.setAngle(rs.angle - 0.4));
      // this.rightRotatableStars.map((rs) => rs.setAngle(rs.angle + 0.4));
      // this.horizontalCrossRightRotation.map((rs) =>
      //     rs.setAngle(rs.angle + 2.5)
      // );
      // this.horizontalCrossLeftRotation.map((rs) =>
      //     rs.setAngle(rs.angle - 2.5)
      // );

      // Bars up/down motion
      // this.motionTimeForUpDownWard += delta;
      // this.upDownMotionElems.map(
      //     ({
      //         matter,
      //         startX,
      //         startY,
      //         moveSpeed,
      //         maxBottom,
      //         maxTop,
      //         direction,
      //     }) => {
      //         const amplitude = (maxBottom - maxTop) / 2;
      //         const offset = amplitude * Math.sin(time * (moveSpeed * 0.01));
      //         // // Calculate new y position using a sine wave for smooth up and down movement
      //         // const range = maxBottom - maxTop;
      //         // const midPoint = maxTop + range / 2;
      //         // Calculate the new position considering the angle
      //         if (direction === "right") {
      //             const newX =
      //                 startX + offset * Math.sin(Phaser.Math.DegToRad(7.1));
      //             const newY =
      //                 startY - offset * Math.cos(Phaser.Math.DegToRad(7.1));
      //             // Update the rectangle's y position using a sine wave
      //             matter.setPosition(newX, newY);
      //         } else {
      //             const newX =
      //                 startX + offset * Math.sin(Phaser.Math.DegToRad(-7.1));
      //             const newY =
      //                 startY - offset * Math.cos(Phaser.Math.DegToRad(-7.1));
      //             // Update the rectangle's y position using a sine wave
      //             matter.setPosition(newX, newY);
      //         }
      //     }
      // );
    }
  }
}
