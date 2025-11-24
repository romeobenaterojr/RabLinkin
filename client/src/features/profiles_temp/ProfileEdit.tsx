// ProfileEdit.tsx
import { Box, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile } from "../../lib/hooks/useProfile";
import { useEffect } from "react";
import { useParams } from "react-router";
import { editProfileSchema, type EditProfileSchema } from "../../lib/schemas/editProfileSchema";
import TextInput from "../../app/shared/component/TextInput";

type Props = {
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ProfileEdit({ setEditMode }: Props) {
  const { id } = useParams<{ id: string }>();
  const { setProfile: updateProfile, profile } = useProfile(id);

  const { control, handleSubmit, reset, formState: { isDirty, isValid } } = useForm<EditProfileSchema>({
    resolver: zodResolver(editProfileSchema),
    mode: "onTouched",
  });

  const onSubmit = (data: EditProfileSchema) => {
    updateProfile.mutate(data, { onSuccess: () => setEditMode(false) });
  };

  useEffect(() => {
    if (profile) {
      reset({ displayName: profile.displayName, bio: profile.bio || "" });
    }
  }, [profile, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2} mt={2}>
      <TextInput label="Display Name" name="displayName" control={control} />
      <TextInput label="Add your bio" name="bio" control={control} multiline rows={4} />
      <Button type="submit" variant="contained" disabled={!isValid || !isDirty || updateProfile.isPending}>
        {updateProfile.isPending ? "Updating..." : "Update Profile"}
      </Button>
    </Box>
  );
}
