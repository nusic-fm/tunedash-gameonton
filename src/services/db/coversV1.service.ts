import { db } from "../firebase.service";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  // setDoc,
  // getDoc,
  // setDoc,
  updateDoc,
  increment,
  runTransaction,
  getDoc,
  Timestamp,
} from "firebase/firestore";

const DB_NAME = "covers";

type ShareInfo = {
  id: string;
  avatar: string;
  name: string;
};
type Comment = {
  content: string;
  timeInAudio: number;
  shareInfo: ShareInfo;
  voiceId: string;
};
export type VoiceV1Cover = {
  url?: string;
  creatorName: string;
  name: string;
  id: string;
  imageUrl: string;
  shareInfo: ShareInfo;
  avatarPath?: string;
};
export type CoverV1 = {
  audioUrl: string;
  metadata: {
    channelId: string;
    channelTitle: string;
    channelDescription: string;
    channelThumbnail: string;
    videoThumbnail: string;
    videoName: string;
    videoDescription: string;
  };
  voices: VoiceV1Cover[];
  //   avatarUrl: string;
  title: string;
  vid: string;
  sections?: { name: string; start: number }[];
  bpm: number;
  duration: number;
  error?: string;
  shareInfo: ShareInfo;
  stemsReady: boolean;
  comments?: Comment[];
  likes?: {
    [id: string]: number;
    total: number;
  };
  commentsCount?: number;
  disLikes?: {
    [id: string]: number;
    total: number;
  };
  totalLikesValue: number;
  playCount: number;
  rank: number;
  prevRank: number;
  createdAt?: Timestamp;
  vocalsStartOffset?: number;
  vocalsEndOffset?: number;
};

const getCoverDocById = async (docId: string) => {
  const d = doc(db, DB_NAME, docId);
  return (await getDoc(d)).data() as CoverV1;
};

const createCoverV1Doc = async (coverObj: CoverV1): Promise<string> => {
  const d = collection(db, DB_NAME);
  const ref = await addDoc(d, { ...coverObj, createdAt: serverTimestamp() });
  return ref.id;
};
const updateCoverV1Doc = async (
  id: string,
  coverObj: Partial<CoverV1>
): Promise<void> => {
  const d = doc(db, DB_NAME, id);
  await updateDoc(d, { ...coverObj, updatedAt: serverTimestamp() });
};

const SUB_COLLECTION = "comments";

const addCommentToCover = async (id: string, commentInfo: Comment) => {
  await runTransaction(db, async (transaction) => {
    const collectionDocRef = doc(collection(db, DB_NAME, id, SUB_COLLECTION));
    transaction.set(collectionDocRef, {
      ...commentInfo,
      createdAt: serverTimestamp(),
    });
    // await addDoc(c, { ...commentInfo, createdAt: serverTimestamp() });
    const d = doc(db, DB_NAME, id);
    transaction.update(d, { commentsCount: increment(1) });
  });
};
export {
  createCoverV1Doc,
  updateCoverV1Doc,
  addCommentToCover,
  getCoverDocById,
  // addToDisLikes,
  // addToLikes,
};
