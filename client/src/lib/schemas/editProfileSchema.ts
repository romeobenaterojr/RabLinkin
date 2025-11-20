
import { z } from "zod";


export const requiredString = (message: string) => z.string().min(1, { message });

export const editProfileSchema = z.object({
  displayName: requiredString("Display Name is required"),
  bio: z.string().optional(),
});


export type EditProfileSchema = z.infer<typeof editProfileSchema>;
