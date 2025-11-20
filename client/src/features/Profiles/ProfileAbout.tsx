import { useParams } from 'react-router';
import { useProfile } from '../../lib/hooks/useProfile';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import ProfileEdit from './ProfileEdit';

export default function ProfileAbout() {
  const { id } = useParams<{ id: string }>();
  const { profile, isCurrentUser } = useProfile(id);
  const [editMode, setEditMode] = useState(false);

  if (!profile) {
    return (
      <Typography variant="body1" color="text.secondary">
        No profile found.
      </Typography>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">About {profile.displayName}</Typography>
        {isCurrentUser && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ overflow: 'auto', maxHeight: 350 }}>
        {!editMode ? (
          <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {profile.bio || 'No description added yet'}
          </Typography>
        ) : (
          // ✅ show edit form if in edit mode
          <ProfileEdit setEditMode={setEditMode} />
        )}
      </Box>
    </Box>
  );
}
