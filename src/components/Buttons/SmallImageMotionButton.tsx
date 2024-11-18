import { Typography } from "@mui/material";
import { motion } from "framer-motion";

type Props = {
  onClick: () => void;
  name: string;
};

const SmallImageMotionButton = ({ onClick, name }: Props) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        width: 141,
        height: 63,
        background: "url(/assets/tunedash/buttons/small.png)",
        backgroundSize: "cover",
        border: "none",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography fontSize={24}>{name}</Typography>
    </motion.button>
  );
};

export default SmallImageMotionButton;
