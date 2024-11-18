import {
    LinearProgressProps,
    Box,
    LinearProgress,
    Typography,
    Stack,
} from "@mui/material";

const LinearProgressWithLabel = (
    props: LinearProgressProps & { value: number }
) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center" }} width={300}>
            <Stack sx={{ width: "100%", mr: 1 }}>
                <LinearProgress variant="determinate" color="info" {...props} />
                <Typography align="center">
                    Preparing {`${Math.round(props.value)}%`}
                </Typography>
            </Stack>
            {/* <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2"></Typography>
            </Box> */}
        </Box>
    );
};

export default LinearProgressWithLabel;

