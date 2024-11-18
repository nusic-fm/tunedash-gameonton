// import { openDB, DBSchema, IDBPDatabase } from "idb";
import * as Tone from "tone";
import { ToneAudioBuffer } from "tone";
import { updateIntroPlayedSeconds } from "../services/db/config.service";

// // Database Configuration
// const idbConfig = {
//     databaseName: "nusic-covers",
//     version: 1,
//     stores: [
//         {
//             name: "covers",
//             id: { keyPath: "id" },
//             indices: [
//                 { name: "id", keyPath: "id", options: { unique: true } },
//                 { name: "data", keyPath: "data", options: { unique: true } },
//             ],
//         },
//     ],
// };

// interface Cover {
//   id: string;
//   data: Float32Array;
// }

// interface CoversDB extends DBSchema {
//   covers: {
//     key: string;
//     value: Cover;
//     indexes: { id: string };
//   };
// }

// Global variables
let instrPlayerRef: Tone.Player | null = null;
let introPlayerRef: Tone.Player | null = null;
let isToneInitialized: boolean = false;
let isMuted: boolean = true;
let isTonePlaying: boolean = false;
let toneLoadingForSection: string | null = null;
let isEnded: boolean = false;
const downloadObj: { [key: string]: ToneAudioBuffer } = {};
const playersRef: { [key: string]: Tone.Player } = {}; // For keeping track of players
let currentlyPlayingUrl: string = "";
let introStartTime: number = 0;
// let db: Promise<IDBPDatabase<CoversDB>> | null = null;

// const initializeDB = async () => {
//   db = openDB<CoversDB>("nusic-covers", 1, {
//     upgrade(db) {
//       const store = db.createObjectStore("covers", {
//         keyPath: "id",
//       });
//       store.createIndex("id", "id", { unique: true });
//     },
//   });
//   return db;
// };

// const addToDB = async (id: string, data: Float32Array) => {
//   if (!db) await initializeDB();
//   const dbInstance = await db!;
//   await dbInstance.put("covers", { id, data });
// };

// const getFromDB = async (id: string): Promise<Float32Array | undefined> => {
//   if (!db) await initializeDB();
//   const dbInstance = await db!;
//   const record = await dbInstance.get("covers", id);
//   return record?.data;
// };

const downloadAudioFiles = async (
  urls: string[],
  onProgress: (progress: number) => void
) => {
  // Delete all keys of downloadObj and free the memory
  Object.keys(downloadObj).forEach((key) => {
    if (urls.includes(key)) return;
    downloadObj[key].dispose();
    playersRef[key]?.dispose();
    delete downloadObj[key];
    delete playersRef[key];
  });
  // console.log("playersObj", playersRef);
  // console.log("downloadObj", downloadObj);
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!downloadObj[url]) {
      // const dataArray = await getFromDB(url);
      // if (dataArray) {
      //   console.log("From Indexed DB", url);
      //   const bf = Tone.Buffer.fromArray(dataArray);
      //   downloadObj[url] = bf;
      // } else {
      console.log("Downloading", url);
      const buffer = await new Promise<ToneAudioBuffer>((res) => {
        const audioBuffer = new Tone.Buffer(url);
        audioBuffer.onload = (bf) => {
          // addToDB(url, bf.toArray() as Float32Array);
          res(bf);
        };
      });
      downloadObj[url] = buffer;
      // addToDB(url, buffer.toArray() as Float32Array);
      // }
    }
    // Update progress
    const progress = ((i + 1) / urls.length) * 100;
    onProgress(progress);
  }
};
const getToneCurrentTime = () => {
  return Tone.Transport.seconds;
};
const initializeTone = async () => {
  // if (!isToneInitialized) {
  isToneInitialized = true;
  await Tone.start();
  console.log("context started");
  setEvents();
  // if (!db) await initializeDB();
  // }
};

const setEvents = () => {
  const transport = Tone.getTransport();
  transport.on("start", () => {
    console.log("Tone Started");
    isTonePlaying = true;
  });
  transport.on("stop", () => {
    console.log("Tone Stopped");
    isTonePlaying = false;
  });
  transport.on("pause", () => {
    console.log("Tone Paused");
    isTonePlaying = false;
  });
  transport.on("loopStart", () => {
    console.log("Tone Loop Started");
    isEnded = false;
  });
  transport.on("loopEnd", () => {
    console.log("Tone Loop Ended");
    isEnded = true;
  });
};

const pausePlayer = () => {
  const transport = Tone.getTransport();
  transport.pause();
};

const playPlayer = () => {
  const transport = Tone.getTransport();
  transport.start();
};

const stopPlayer = () => {
  const transport = Tone.getTransport();
  transport.stop();
};

const marbleRaceOnlyInstrument = async (
  id: string,
  bpm: number,
  startOffset: number,
  endOffset: number
) => {
  if (introPlayerRef) {
    const totalSecondsPlayed = Tone.now() - introStartTime;
    // console.warn(
    //   `%c Intro played for: ${totalSecondsPlayed.toFixed(2)}s`,
    //   "background: #222; color: #bada55"
    // );
    updateIntroPlayedSeconds(totalSecondsPlayed);
    introPlayerRef?.stop();
    introPlayerRef?.dispose();
    introPlayerRef = null;
  }
  const transport = Tone.getTransport();
  if (bpm) transport.bpm.value = bpm;
  else transport.bpm.dispose();
  await initializeTone();
  if (transport.seconds) {
    transport.seconds = 0;
    transport.stop();
  }
  if (instrPlayerRef) {
    instrPlayerRef.stop();
    instrPlayerRef.dispose();
    instrPlayerRef = null;
  }
  if (currentlyPlayingUrl && playersRef[currentlyPlayingUrl]) {
    playersRef[currentlyPlayingUrl].stop();
    playersRef[currentlyPlayingUrl].dispose();
    delete playersRef[currentlyPlayingUrl];
    delete downloadObj[currentlyPlayingUrl];
    currentlyPlayingUrl = "";
  }
  const instrDataArray: Tone.ToneAudioBuffer =
    downloadObj[`https://voxaudio.nusic.fm/covers/${id}/instrumental.mp3`];
  const instrPlayer = new Tone.Player(instrDataArray).sync().toDestination();
  instrPlayerRef = instrPlayer;
  const voicesUrls = Object.keys(downloadObj).slice(1);
  for (let i = 0; i < voicesUrls.length; i++) {
    const url = voicesUrls[i];
    playersRef[url] = new Tone.Player(downloadObj[url]).toDestination();
  }
  await Tone.loaded();
  instrPlayerRef.start();
  const voiceUrl = voicesUrls[0];
  currentlyPlayingUrl = voiceUrl;
  console.log("Loop points", startOffset, endOffset);
  transport.setLoopPoints(startOffset, endOffset);
  transport.loop = true;
  playersRef[voiceUrl].setLoopPoints(startOffset, endOffset);
  playersRef[voiceUrl].loop = true;
  playersRef[voiceUrl].start(undefined, startOffset);
  transport.start(undefined, startOffset);
  // introStartTime = Tone.now();
  // console.log("Loop points: ", startOffset, endOffset);
};

const prepareVocalPlayers = async (urls: string[]) => {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (url in playersRef) continue;
    playersRef[url] = new Tone.Player(downloadObj[url]).toDestination();
  }
  await Tone.loaded();
};

const switchVocalsByDownloading = async (
  id: string,
  vId: string,
  oldVId: string
) => {
  await initializeTone();
  if (oldVId === vId) return;
  // // Delete and dispose the old downloadobj
  // downloadObj[
  //   `https://voxaudio.nusic.fm/covers/${id}/${oldVId}.mp3`
  // ]?.dispose();
  // delete downloadObj[`https://voxaudio.nusic.fm/covers/${id}/${oldVId}.mp3`];
  const url = `https://voxaudio.nusic.fm/covers/${id}/${vId}.mp3`;
  if (currentlyPlayingUrl === url) return;
  // const dataArray = await getFromDB(url);
  let bf: ToneAudioBuffer;
  // if (dataArray) {
  //   console.log("From Indexed DB");
  //   bf = Tone.Buffer.fromArray(dataArray);
  // } else {
  console.log("Downloading", url);
  const buffer = await new Promise<ToneAudioBuffer>((res) => {
    const audioBuffer = new Tone.Buffer(url);
    audioBuffer.onload = (bf) => {
      // addToDB(url, bf.toArray() as Float32Array);
      res(bf);
    };
  });
  bf = buffer;
  // }
  playersRef[url] = new Tone.Player(bf).toDestination();

  if (currentlyPlayingUrl) {
    playersRef[currentlyPlayingUrl].stop();
    playersRef[currentlyPlayingUrl].dispose();
    delete playersRef[currentlyPlayingUrl];
    currentlyPlayingUrl = "";
  }
  // const totalSecondsPlayed = Tone.now() - introStartTime;
  // console.warn(
  //   `%c ${oldVId} played for: ${totalSecondsPlayed.toFixed(2)}s`,
  //   "background: #222; color: #bada55"
  // );
  const transport = Tone.getTransport();
  playersRef[url].start(undefined, transport.seconds);
  // console.log("Loop points: ", transport.loopStart, transport.loopEnd);
  playersRef[url].setLoopPoints(transport.loopStart, transport.loopEnd);
  playersRef[url].loop = true;
  currentlyPlayingUrl = url;
  // introStartTime = Tone.now();
};

const marbleRacePlayVocals = async (id: string, vId: string) => {
  await initializeTone();
  const url = `https://voxaudio.nusic.fm/covers/${id}/${vId}.mp3`;
  if (currentlyPlayingUrl) {
    playersRef[currentlyPlayingUrl].stop();
    currentlyPlayingUrl = "";
  }
  if (url in playersRef) {
    currentlyPlayingUrl = url;
    const transport = Tone.getTransport();
    playersRef[url].start(undefined, transport.seconds);
    playersRef[url].setLoopPoints(transport.loopStart, transport.loopEnd);
    playersRef[url].loop = true;
  }
};

const stopAndDestroyPlayers = () => {
  if (instrPlayerRef) {
    instrPlayerRef.stop();
    instrPlayerRef.dispose();
    instrPlayerRef = null;
  }
  const downloadObjKeys = Object.keys(downloadObj);
  downloadObj[downloadObjKeys[0]]?.dispose();
  delete downloadObj[downloadObjKeys[0]];
  const voicesUrls = downloadObjKeys.slice(1);
  for (let i = 0; i < voicesUrls.length; i++) {
    const url = voicesUrls[i];
    if (playersRef[url]) {
      playersRef[url].stop();
      playersRef[url].dispose();
      delete playersRef[url];
      delete downloadObj[url];
    }
  }
  Tone.Transport.stop();
  console.log("downloadObj", downloadObj);
};

const getToneStatus = () => {
  return {
    isTonePlaying,
    isMuted,
    toneLoadingForSection,
  };
};

const toggleMuteAudio = async () => {
  isMuted = !isMuted;
  if (introPlayerRef) {
    if (!isTonePlaying) {
      await initializeTone();
      introStartTime = Tone.now();
      introPlayerRef.start(introStartTime, 164.3);
      isTonePlaying = true;
    }
    introPlayerRef.mute = isMuted;
  }
  if (!isTonePlaying) return;
  playersRef[currentlyPlayingUrl] &&
    (playersRef[currentlyPlayingUrl].mute = isMuted);
  instrPlayerRef && (instrPlayerRef.mute = isMuted);
};

const downloadAndPlayIntro = async () => {
  // await initializeDB();
  const url = "https://voxaudio.nusic.fm/intro.mp3?alt=media";
  // const dataArray = await getFromDB(url);
  // let bf: ToneAudioBuffer;
  // if (dataArray) {
  //   console.log("From Indexed DB");
  //   bf = Tone.Buffer.fromArray(dataArray);
  // } else {
  console.log("Downloading", url);
  const buffer = await new Promise<ToneAudioBuffer>((res) => {
    const audioBuffer = new Tone.Buffer(url);
    audioBuffer.onload = (bf) => {
      // addToDB(url, bf.toArray() as Float32Array);
      res(bf);
    };
  });
  // bf = buffer;
  // }
  const introPlayer = new Tone.Player(buffer).toDestination();
  introPlayer.setLoopPoints(164.3, 246.5);
  introPlayer.loop = true;
  introPlayerRef = introPlayer;
};

// const downloadAndPlaySound = async (url: string) => {
//   await initializeTone();
//   const player = new Tone.Player(downloadObj[url]).toDestination();
//   player.start();
// };

export {
  initializeTone,
  downloadAudioFiles,
  marbleRaceOnlyInstrument,
  marbleRacePlayVocals,
  pausePlayer,
  playPlayer,
  stopPlayer,
  getToneStatus,
  stopAndDestroyPlayers,
  getToneCurrentTime,
  prepareVocalPlayers,
  toggleMuteAudio,
  downloadAndPlayIntro,
  switchVocalsByDownloading,
  // downloadAndPlaySound,
};
