import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase.service";

const DB_NAME = "tunedash_config";
const updateIntroPlayedSeconds = (seconds: number) => {
  const d = doc(db, DB_NAME, "prod");
  const secondsToIncrement = Number(seconds.toFixed(2));
  console.log("Intro played seconds: ", secondsToIncrement);
  setDoc(
    d,
    { introPlayedSeconds: increment(secondsToIncrement) },
    { merge: true }
  );
};
export { updateIntroPlayedSeconds };
