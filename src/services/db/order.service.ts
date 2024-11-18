import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { VoiceV1Cover } from "./coversV1.service";
import { db } from "../firebase.service";

const DB_NAME = "tune_dash_orders";

const createOrder = async (
  userId: string,
  voiceInfo: VoiceV1Cover,
  cost: number
): Promise<string> => {
  const col = collection(db, DB_NAME);
  const docRef = await addDoc(col, {
    userId,
    voiceInfo,
    cost,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export { createOrder };
