import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useState, type SyntheticEvent } from "react";
import ProfilePhoto from "./ProfilePhoto";
import ProfileAbout from "./ProfileAbout";
import ProfileFollowings from "./profileFollowings";
import ProfileActivities from "./ProfileActivities";

export default function ProfileContent() {
  const [value, setValue] = useState(0);
  const handleChange = (_: SyntheticEvent, newValue: number) => setValue(newValue);

  const tabContent = [
    { label: 'About', content: <ProfileAbout /> },
    { label: 'Photos', content: <ProfilePhoto /> },
    { label: 'Event', content: <ProfileActivities /> },
    { label: 'Followers', content: <ProfileFollowings activeTab={value}/> },
    { label: 'Followings', content: <ProfileFollowings activeTab={value}/> },
  ];

  return (
    <Box
      component={Paper}
      mt={2}
      p={3}
      elevation={3}
      height={500}
      sx={{ display: 'flex', alignItems: 'flex-start', borderRadius: 3 }}
    >
      <Tabs
        orientation="vertical"
        value={value}
        onChange={handleChange}
        sx={{ borderRight: 1, borderColor: 'divider', height: 450, minWidth: 200 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabContent.map((tab, index) => (
          <Tab key={index} label={tab.label} sx={{ m: 1 }} />
        ))}
      </Tabs>

      <Box sx={{ flexGrow: 1, p: 3, pt: 0 }}>
        {tabContent[value].content}
      </Box>
    </Box>
  );
}
