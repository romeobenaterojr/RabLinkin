import { useParams } from 'react-router';
import { useProfile } from '../../lib/hooks/useProfile';
import { Box, Button, Divider, Typography } from '@mui/material';

export default function ProfileAbout() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useProfile(id);

//   if (loading) {
//     return (
//       <Typography variant="body1" color="text.secondary">
//         Loading profile...
//       </Typography>
//     );
//   }

  if (!profile) {
    return (
      <Typography variant="body1" color="text.secondary">
        No profile found.
      </Typography>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h5">
          About {profile.displayName}
        </Typography>
          <Button>
            Edit Profile
         </Button>
       </Box>
        <Divider sx={{my: 2}} />
        <Box sx={{overflow: 'auto', maxHeight: 350}}>
            <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {profile.bio ||  'No description added yet'}
            </Typography>  
        </Box>
      
       
    </Box>
  );
}
