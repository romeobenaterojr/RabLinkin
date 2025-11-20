import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  TextField,
} from "@mui/material";

import { useComments } from "../../../lib/hooks/UseComments";

import { observer, Observer } from "mobx-react-lite";
import { useRef } from "react";
import { Link, useParams } from "react-router";
import { timeAgo } from "../../../lib/util/util";
import { useForm, type FieldValues } from "react-hook-form";



const ActivityDetailsChat = observer(function ActivityDetailsChat () {
  const { id } = useParams();

  const { CommentStore } = useComments(id);

   const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const commentsEndRef = useRef<HTMLDivElement>(null);

  const AddComment = async (data: FieldValues) => {
    try {
      await CommentStore.hubConnection?.invoke('SendComment', {
        activityId: id,
        body: data.body
      });
      reset();
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
       handleSubmit(AddComment)();
    }
  };

  return (
    <Observer>
      {() => (
        <>
       
          <Box
            sx={{
              textAlign: "center",
              bgcolor: "primary.main",
              color: "white",
              padding: 2,
            }}
          >
            <Typography variant="h6">Chat about this event</Typography>
          </Box>

          <Card>
            <CardContent>

              
              <form>
                <TextField
                  {...register('body', { required: true })}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Enter your comment (Enter to submit, SHIFT + Enter for new line)"
                  onKeyDown={handleKeyPress}
                  slotProps={{
                    input: {
                      endAdornment: isSubmitting ?(
                        <CircularProgress size={24} />
                      ) : null
                    }
                  }}
                />
              </form>

              {/* Comment List */}
              <Box sx={{ height: 400, overflowY: "auto", mt: 2 }}>
                {CommentStore.loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  CommentStore.comments.map((comment) => (
                    <Box key={comment.id} sx={{ display: "flex", my: 2 }}>
                      <Avatar src={comment.imageUrl} alt="user image" sx={{ mr: 2 }} />
                      <Box display="flex" flexDirection="column">
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography
                            component={Link}
                            to={`/profiles/${comment.userId}`}
                            variant="subtitle1"
                            sx={{ fontWeight: "bold", textDecoration: "none" }}
                          >
                            {comment.displayName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {timeAgo(comment.createdAt)}
                          </Typography>
                        </Box>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>{comment.body}</Typography>
                      </Box>
                    </Box>
                  ))
                )}
                <div ref={commentsEndRef} />
              </Box>

            </CardContent>
          </Card>
        </>
      )}
    </Observer>
  );
})

export default ActivityDetailsChat;
