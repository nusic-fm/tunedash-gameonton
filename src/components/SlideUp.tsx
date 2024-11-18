import { Box, Typography } from "@mui/material";
import React from "react";
import BouncingBallsLoading from "./BouncingBallsLoading";
import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import { motion } from "framer-motion";

type Props = {};

// This is the component that slides up to show the user the options
const SlideUp = ({
  onSlideUp,
  enableSlideUp,
}: {
  onSlideUp: () => void;
  enableSlideUp: boolean;
}) => {
  const [position, setPosition] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const startY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSlideUp) return;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSlideUp) return;
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY.current - currentY;
    setPosition(Math.max(0, Math.min(window.innerHeight, position + diff)));
    startY.current = currentY;
  };

  const handleTouchEnd = () => {
    if (!enableSlideUp) return;
    setIsDragging(false);
    if (position > window.innerHeight / 2) {
      setPosition(window.innerHeight);
      onSlideUp();
    } else {
      setPosition(0);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "100vh",
        transform: `translateY(-${position}px)`,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
        backgroundImage: "url(/assets/tunedash/bgs/splash.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 1000,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"flex-end"}
    >
      {enableSlideUp ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 250,
            height: 83,
            background: "url(/assets/tunedash/buttons/long.png)",
            backgroundSize: "cover",
            border: "none",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
          }}
          onClick={() => {
            // Instantly slide up and call onSlideUp
            const duration = 250;
            const step = 10;
            let i = 0;
            setInterval(() => {
              setPosition(window.innerHeight - step * i);
              i++;
            }, step);
            setTimeout(() => {
              onSlideUp();
            }, duration);
          }}
        >
          <KeyboardDoubleArrowUpRoundedIcon />
          <Typography fontSize={20}>Slide Up</Typography>
          <KeyboardDoubleArrowUpRoundedIcon />
        </motion.button>
      ) : (
        <BouncingBallsLoading />
      )}
    </Box>
  );
};

export default SlideUp;
