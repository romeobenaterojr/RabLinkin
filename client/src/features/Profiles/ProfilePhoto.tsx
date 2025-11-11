import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";
import { Box, ImageList, ImageListItem, Typography, Button, useMediaQuery, useTheme, Divider } from "@mui/material";
import { useState } from "react";
import PhotoUploadWidget from "../../app/shared/component/PhotoUploadWidget";
import StarButton from "../../app/shared/component/StarButton";
import DeleteButton from "../../app/shared/component/DeleteButton";

export default function ProfilePhoto() {
  const { id } = useParams();
  const { photos, loadingPhoto, isCurrentUser, upload, profile, setMainPhoto, deletePhoto } = useProfile(id); 
  const [editMode, setEditMode] = useState(false);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));

  // Responsive column count
  let cols = 2;
  if (isMd) cols = 6;
  else if (isSm) cols = 4;

  const handlePhotoUpload = (file: Blob) => {
    upload.mutate(file, {
      onSuccess: () => {
        setEditMode(false)
      }
    });
  }

  if (loadingPhoto) return <Typography>Loading photos...</Typography>;
  if (!photos) return <Typography>No photos found for this user</Typography>;

  return (
    <Box>  
      
        <Box display='flex' justifyContent='space-between'>
          <Typography variant="h5">Photos</Typography>
          {isCurrentUser && (
          <Button variant="contained" onClick={() => setEditMode(!editMode)}>
            {editMode ? "Cancel" : "Add Photo"}
          </Button>
               )}
        </Box>
        <Divider sx={{my: 2}} />
      {editMode && isCurrentUser ? (
        <Box>
         <PhotoUploadWidget
            upload={handlePhotoUpload}
            loading={upload.isPending}
         />
        </Box>
      ) : (
        <>
        {photos.length === 0 ? (
          <Typography>No Photo Added yet</Typography>
        ) : (
          <ImageList sx={{ width: "100%", height: "auto" }} cols={cols} rowHeight={164}>
          {photos.map((item) => (
            <ImageListItem key={item.id}>
              <img
                srcSet={item.url.replace(
                  '/upload',
                  '/upload/w_164,h_164,c_fill,f_auto,dpr_2,g_face/'
                )}
                src={item.url.replace(
                  '/upload',
                  '/upload/w_164,h_164,c_fill,f_auto,g_face/'
                )}
                alt={`User photo ${item.id}`}
                loading="lazy"
              />
              {isCurrentUser && (
                <div>
                <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left:0
                    }}
                    onClick={() => setMainPhoto.mutate(item)}
                  >
                    <StarButton selected={item.url === profile?.imageUrl} />
                  </Box>
                    {profile?.imageUrl !== item.url && (
                      <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right:0
                      }}
                      onClick={() => deletePhoto.mutate(item.id)}
                    >
                      <DeleteButton />
                    </Box>
                    )}
                </div>
                  
                  
              )}

            </ImageListItem>
          ))}
        </ImageList>
        )}
        </>
       
      )}
    </Box>
  );
}
