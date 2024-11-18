import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { motion } from "framer-motion";

type Props = {
  showBackButton: boolean;
  showCoverTitle: boolean;
  onBackButtonClick?: () => void;
  coverTitle: string;
};

const Header = ({
  showBackButton,
  showCoverTitle,
  onBackButtonClick,
  coverTitle,
}: Props) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems={"center"}
      width={"100%"}
      py={2}
      position={"absolute"}
      top={0}
      left={0}
      zIndex={99}
    >
      <Box width={60} height={60}>
        {showBackButton && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: `url("/assets/tunedash/back.png") center center / contain no-repeat`,
              border: "none",
              cursor: "pointer",
              width: 60,
              height: 60,
            }}
            onClick={onBackButtonClick}
          />
        )}
      </Box>

      {showCoverTitle && (
        <Box
          position={"relative"}
          width={229}
          height={32}
          sx={{ overflow: "hidden" }}
        >
          <img src="/assets/tunedash/player-topbar.png" alt="logo" />
          <Typography
            position="absolute"
            top={0}
            left={8}
            // width={"calc(100% - 24px)"}
            height={"100%"}
            display={"flex"}
            // justifyContent={"center"}
            alignItems={"center"}
            fontSize={"12px"}
            sx={{
              // scrolling text
              // textOverflow: "ellipsis",
              // overflow: "hidden",
              whiteSpace: "nowrap",
            }}
            id="scroll-text"
          >
            {coverTitle}
          </Typography>
        </Box>
      )}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: `url("/assets/tunedash/hamburger-menu.png") center center / contain no-repeat`,
          border: "none",
          cursor: "pointer",
          width: 60,
          height: 60,
        }}
        onClick={() => {
          window.open(
            "//sbx-crypto-payment.alchemypay.org/?orderNum=300217314207413593603",
            "_blank"
          );
        }}
      />
    </Stack>
  );
};

export default Header;
