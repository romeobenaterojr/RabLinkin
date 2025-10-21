import { AccessTime, Place } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { Link } from "react-router";
import { formatDate } from "../../../lib/util/util";


type Props = {
  activity: Activity;
};

export default function ActivityCard({ activity }: Props) {
  const isHost = false;
  const isGoing = false;
  const isCancelled = false;

  const label = isHost ? "You are hosting" : "You are going";
  const color = isHost ? "secondary" : isGoing ? "warning" : "default";

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
     
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <CardHeader
          avatar={<Avatar sx={{ height: 80, width: 80 }} />}
          title={activity.title}
          subheader={
            <>
              Hosted by <Link to="/profiles/rom">Rom</Link>
            </>
          }
          slots={{
            title: Typography,
            subheader: Typography,
          }}
          slotProps={{
            title: {
              sx: { fontWeight: "bold", fontSize: 20 },
            },
            subheader: {
              sx: { fontSize: 14, color: "text.secondary" },
            },
          }}
        />

        <Box display="flex" flexDirection="column" gap={1.5} mr={2}>
          {(isHost || isGoing) && (
            <Chip label={label} color={color} sx={{ borderRadius: 2 }} />
          )}
          {isCancelled && (
            <Chip label="Cancelled" color="error" sx={{ borderRadius: 2 }} />
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

  
      <CardContent sx={{ p: 0 }}>
        <Box display="flex" alignItems="center" mb={2} px={2}>
          <Box display='flex' flexGrow={0} alignContent='center'>
            <AccessTime sx={{ mr: 1 }} />
            <Typography variant="body2" noWrap>
              {formatDate(activity.date)}
            </Typography>
          </Box>

          <Place sx={{ ml: 3, mr: 1 }} />
          <Typography variant="body2">{activity.venue}</Typography>
        </Box>

        <Divider />

        <Box
          display="flex"
          gap={2}
          sx={{
            backgroundColor: "grey.200",
            py: 3,
            pl: 3,
          }}
        >
          Attendees go here
        </Box>
      </CardContent>


      <CardContent
        sx={{
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
          {activity.description}
        </Typography>

        <Button
          component={Link}
          to={`/activities/${activity.id}`}
          size="medium"
          variant="contained"
          sx={{ borderRadius: 3 }}
        >
          View
        </Button>
      </CardContent>
    </Card>
  );
}
