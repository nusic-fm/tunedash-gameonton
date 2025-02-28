import { Timestamp } from "firebase/firestore";
import { VoiceV1Cover } from "../services/db/coversV1.service";
import _ from "lodash";

export const getClosesNoInArr = (arr: number[], goal: number) =>
  arr.reduce((prev, curr) =>
    Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  );
export const getYouTubeVideoId = (url: string) => {
  // YouTube video ID regex
  const regex = /[?&]v=([^#&]*)/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    // Handle cases where the URL format may differ
    console.error("Invalid YouTube URL");
    return null;
  }
};

export const getUserAvatar = (uid: string, avatarId: string) => {
  if (avatarId.length <= 2) {
    return `https://voxaudio.nusic.fm/avatars%2F${avatarId}.webp?alt=media`;
  }
  return `https://cdn.discordapp.com/avatars/${uid}/${avatarId}`;
};

export const nameToSlug = (name: string, delimiter = "-") => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, delimiter) // Replace spaces with delimiter
    .replace(new RegExp(`${delimiter}+`, "g"), delimiter) // Replace consecutive delimiters
    .trim(); // Trim any leading/trailing whitespace
};

// Format a duration in seconds to a string in the format "mm:ss"
export const formatDuration = (value: number) => {
  const minute = Math.floor(value / 60);
  const secondLeft = value - minute * 60;
  return `${minute}:${
    secondLeft < 10 ? `0${secondLeft.toFixed(0)}` : secondLeft.toFixed(0)
  }`;
};

export const formatSecondsTohr = (seconds: number) => {
  // Calculate hours, minutes, and seconds
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  // Format the time string
  const formattedHours = hrs > 0 ? `${hrs.toString().padStart(2, "0")}h:` : "";
  const formattedMinutes = mins.toString().padStart(2, "0");
  const formattedSeconds = secs.toString().padStart(2, "0");

  return `${formattedHours}${formattedMinutes}m:${formattedSeconds}s`;
};

// const isLink = (text: string) => {
//     // Regular expression pattern to match URLs
//     var urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;

//     return urlPattern.test(text);
// }

// Convert Firebase timestamp to a date string formatted to either "1h ago" or "May 21"
export const timestampToDateString = (timestamp?: Timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = diff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (hours < 24) {
    return `${Math.floor(hours)}h ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};

export const sortArrBasedOnLikesObj = (
  voices: VoiceV1Cover[],
  likesObj?: { [key: string]: number; total: number }
) => {
  if (likesObj === undefined) return voices;

  return voices.sort((a, b) => {
    // compare the likes of the two voices and then return the voice with the most likes
    return (likesObj[b.id] || 0) - (likesObj[a.id] || 0);
  });
};

// export const timestampToDateString = (timestamp: Timestamp) => {
//   const date = timestamp.toDate();
//   const options = { weekday: "long", hour: "numeric", minute: "numeric" };
//   //No overload matches this call.
//   // return date.toLocaleDateString("en-US", options);
//   return date.toLocaleDateString("en-US", {
//     weekday: "long",
//     hour: "numeric",
//     minute: "numeric",
//   });
// };
export const createRandomNumber = (min: number, max: number, not?: number) => {
  let random = Math.floor(Math.random() * (max - min + 1) + min);
  while (random === not) {
    random = Math.floor(Math.random() * (max - min + 1) + min);
  }
  return random;
};

export const calculateXYPosition = (
  containerWidth: number,
  containerHeight: number,
  elementWidth: number,
  elementHeight: number
) => {
  // Initial position from left and top properties
  let x = 0.5 * containerWidth;
  let y = 0.9 * containerHeight;

  // Adjust for the translate(-50%, -50%) transform
  x -= 0.5 * elementWidth;
  y -= 0.5 * elementHeight;

  return { x, y };
};

export const calculatePositions = (
  containerWidth: number,
  containerHeight: number,
  innerContainerWidth: number,
  n: number
) => {
  // Element size
  const elementWidth = 60;
  const elementHeight = 60;

  // Reference point
  const refX = 0.5 * containerWidth;
  const refY = 0.9 * containerHeight;

  // Adjust for translation (-50%, -50%)
  const centerX = refX - 0.5 * elementWidth;
  const centerY = refY - 0.5 * elementHeight;

  // Calculate the number of rows and columns needed based on the inner container width
  const cols = Math.floor(innerContainerWidth / elementWidth);
  const rows = Math.ceil(n / cols);

  // Calculate the starting top-left position of the grid
  const startX = centerX - ((cols - 1) * elementWidth) / 2;
  const startY = centerY - ((rows - 1) * elementHeight) / 2;

  // if there is only one row, center the elements horizontally
  if (rows === 1) {
    const positions = [];
    for (let i = 0; i < n; i++) {
      const x = centerX + (i - (n - 1) / 2) * elementWidth;
      const y = centerY;
      positions.push({ x, y });
    }
    return positions;
  }

  // Initialize an array to store positions
  const positions = [];

  // Loop to calculate positions for each element in the grid
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = startX + col * elementWidth;
    const y = startY + row * elementHeight;
    positions.push({ x, y });
  }

  return positions;

  // // Calculate the starting left position of the row
  // const startX = centerX - ((n - 1) * elementWidth) / 2;

  // // Initialize an array to store positions
  // const positions = [];

  // // Loop to calculate positions for each element in the row
  // for (let i = 0; i < n; i++) {
  //   const x = startX + i * elementWidth;
  //   const y = centerY; // All elements in the same row
  //   positions.push({ x, y });
  // }

  // return positions;

  // // Calculate the number of rows and columns needed
  // const rows = Math.ceil(Math.sqrt(n));
  // const cols = rows;

  // // Calculate the starting top-left position of the grid
  // const startX = centerX - ((cols - 1) * elementWidth) / 2;
  // const startY = centerY - ((rows - 1) * elementHeight) / 2;

  // // Initialize an array to store positions
  // const positions = [];

  // // Loop to calculate positions for each element in the grid
  // for (let i = 0; i < n; i++) {
  //   const row = Math.floor(i / cols);
  //   const col = i % cols;
  //   const x = startX + col * elementWidth;
  //   const y = startY + row * elementHeight;
  //   positions.push({ x, y });
  // }

  // return positions;

  // // Positions for the 4 elements in a 2x2 grid
  // const positions = [
  //   { x: centerX - elementWidth * 2, y: centerY - elementHeight / 2 }, // Top-left
  //   { x: centerX - elementWidth * 1, y: centerY - elementHeight / 2 }, // Top-right
  //   { x: centerX + elementWidth * 1, y: centerY - elementHeight / 2 }, // Bottom-left
  //   { x: centerX + elementWidth * 2, y: centerY - elementHeight / 2 }, // Bottom-right
  // ];

  // return positions;
};

// Fill the array with its elements until it reaches the desired length
export const duplicateArrayElemToN = (
  arr: string[],
  n: number = 6
): string[] => {
  const result = [];
  const everySecondResultShouldBe = arr.filter((v) =>
    ["01", "03", "07"].includes(v)
  );
  const others = arr.filter((v) => !["01", "03", "07"].includes(v));
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) {
      result.push(_.sample(everySecondResultShouldBe));
    } else {
      result.push(_.sample(others));
    }
  }
  return result as string[];
};

export const getBeatsArray = (id: string, startOffset: number): number[] => {
  //
  return [];
};

// Beats array is the array of beats in the song
// groupLength is the number of beats in the group
// groupInterval is the interval between the start of each group
export const createBeatsGroupWithInterval = (
  beatsArray: number[],
  groupLength: number,
  noOfGroups: number,
  groupInterval: number
) => {
  // Create beats from random index for the number groupLength
  // Then Ignore the groupInterval no of beats
  // Then create a new group
  // Repeat the above step for the number of groups
  // Return the result
  const resultShowBeats = [];
  let beatIndex = createRandomNumber(8, 16);
  for (let i = 0; i < noOfGroups; i++) {
    for (let j = 0; j < groupLength; j++) {
      resultShowBeats.push(beatsArray[beatIndex]);
      beatIndex += createRandomNumber(1, 3);
    }
    beatIndex += groupInterval;
  }
  return resultShowBeats;
};

export const getBackgroundPath = (id: string) => ``;
export const getTrailPath = (id: string) => ``;
export const getSkinPath = (id: string) => ``;
export const getTrackPath = (id: string) => ``;
export const getTrackPreviewPath = (id: string) => ``;
export const getVoiceAvatarPath = (voiceId: string) => ``;

// const verifySignature = (data: any, key: string, expectedSignature: string) => {
//   const dataWithoutSign = { ...data };
//   delete dataWithoutSign.sign; // Remove existing signature for verification

//   const dataString = Object.entries(dataWithoutSign)
//     .sort()
//     .map(([k, v]) => `${k}=${v}`)
//     .join("&");
//   const actualSignature = crypto.HmacSHA512(dataString, key);

//   return actualSignature.toString() === expectedSignature;
// };
export const voiceList = [];
export const tireList = [];

export const tireCost = [];
