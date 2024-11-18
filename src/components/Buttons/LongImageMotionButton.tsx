import { Typography } from "@mui/material";
import { motion } from "framer-motion";

type Props = {
  onClick: () => void;
  name: string;
  width?: number;
  height?: number;
  disabled?: boolean;
};

const LongImageMotionButton = ({
  onClick,
  name,
  width,
  height,
  disabled,
}: Props) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: width || 250,
        height: height || 83,
        background: "url(/assets/tunedash/buttons/long.png)",
        backgroundSize: "cover",
        border: "none",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Typography fontSize={20}>{name}</Typography>
    </motion.button>
  );
};

export default LongImageMotionButton;
