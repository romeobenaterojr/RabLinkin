import { Box, Button, Paper, Typography } from "@mui/material";
import { useActivities } from "../../../lib/hooks/useActivities";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import TextInput from "../../../app/shared/component/TextInput";
import SelectInput from "../../../app/shared/component/SelectInput";
import { categoryOptions } from "./categoryOption";
import DateTimeInput from "../../../app/shared/component/DateTimeInput";
import LocationInput from "../../../app/shared/component/LocationInput";
import { activitySchema, type ActivitySchema } from "../../../lib/schemas/activitySchema";
import type { Activity } from "../../../lib/types";

export default function ActivityForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateActivity, createActivity, activity, isLoadingActivity } = useActivities(id);

  const { reset, control, handleSubmit } = useForm<ActivitySchema>({
    mode: "onTouched",
    resolver: zodResolver(activitySchema),
  });


  useEffect(() => {
    if (activity) {
      reset({
        ...activity,
        date: activity.date ? new Date(activity.date) : new Date(),
        location: {
          city: activity.city,
          venue: activity.venue,
          latitude: activity.latitude,
          longitude: activity.longitude,
        },
      });
    }
  }, [activity, reset]);

  const onSubmit = (data: ActivitySchema) => {
    const { location, ...rest } = data;

  
    const activityToSave: Activity = {
      ...rest,
      ...location,
      id: activity?.id || crypto.randomUUID(),
      isCancelled: activity?.isCancelled ?? false,
    };

    if (activity) {
      updateActivity.mutate(activityToSave, {
        onSuccess: () => navigate(`/activities/${activity.id}`),
      });
    } else {
      createActivity.mutate(activityToSave, {
        onSuccess: (newId) => navigate(`/activities/${newId}`),
      });
    }
  };

  if (isLoadingActivity) return <Typography>Loading...</Typography>;

  return (
    <Paper sx={{ borderRadius: 3, padding: 3 }}>
      <Typography variant="h5" gutterBottom color="primary">
        {activity ? "Edit activity" : "Create activity"}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        display="flex"
        flexDirection="column"
        gap={3}
      >
        <TextInput label="Title" control={control} name="title" />
        <TextInput label="Description" control={control} name="description" multiline rows={3} />
        <Box display="flex" gap={3}>
          <SelectInput items={categoryOptions} label="Category" control={control} name="category" />
          <DateTimeInput label="Date" control={control} name="date" />
        </Box>
        <LocationInput control={control} label="Enter the Location" name="location" />

        <Box display="flex" justifyContent="end" gap={3}>
          <Button color="inherit">Cancel</Button>
          <Button
            color="success"
            type="submit"
            variant="contained"
            disabled={updateActivity.isPending || createActivity.isPending}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
