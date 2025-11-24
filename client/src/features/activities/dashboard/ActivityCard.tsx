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
import AvatarPopover from "../../../app/shared/AvatarPopover";

type Props = {
  activity: Activity;
};

export default function ActivityCard({ activity }: Props) {
  const label = activity.isHost ? "You are hosting" : "You are going";
  const color = activity.isHost
    ? "secondary"
    : activity.isGoing
    ? "warning"
    : "default";

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        mb: 3,            
        p: 2,             
      }}
    >
      {/* HEADER SECTION */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={1}
      >
        <CardHeader
          avatar={
            <Avatar
              src={activity.hostImageUrl}
              sx={{ height: 80, width: 80 }}
              alt="image of host"
            />
          }
          title={activity.title}
          subheader={
            <>
              Hosted by{" "}
              <Link to={`/profile/${activity.hostId}`}>
                {activity.hostDisplayName}
              </Link>
            </>
          }
          slots={{
            title: Typography,
            subheader: Typography,
          }}
          slotProps={{
            title: { sx: { fontWeight: "bold", fontSize: 20 } },
            subheader: { sx: { fontSize: 14, color: "text.secondary" } },
          }}
          sx={{ p: 0 }}
        />

        {/* STATUS TAGS */}
        <Box display="flex" flexDirection="column" gap={1.2} ml={2} mr={1}>
          {(activity.isHost || activity.isGoing) && (
            <Chip
              variant="outlined"
              label={label}
              color={color}
              sx={{ borderRadius: 2 }}
            />
          )}
          {activity.isCancelled && (
            <Chip label="Cancelled" color="error" sx={{ borderRadius: 2 }} />
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* DATE + VENUE */}
      <CardContent sx={{ p: 0 }}>
        <Box display="flex" alignItems="center" mb={2} px={2}>
          <Box display="flex" alignItems="center">
            <AccessTime sx={{ mr: 1 }} />
            <Typography variant="body2" noWrap>
              {formatDate(activity.date)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" ml={4}>
            <Place sx={{ mr: 1 }} />
            <Typography variant="body2">{activity.venue}</Typography>
          </Box>
        </Box>

        <Divider />

        {/* ATTENDEES */}
        <Box
          display="flex"
          gap={2}
          sx={{
            backgroundColor: "grey.100",
            py: 3,
            pl: 3,
          }}
        >
          {activity.attendees.map((att) => (
            <AvatarPopover profile={att} key={att.id} />
          ))}
        </Box>
      </CardContent>

      {/* DESCRIPTION + VIEW BUTTON */}
      <CardContent
        sx={{
          pt: 3,
          pb: 1,
          px: 1,
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
