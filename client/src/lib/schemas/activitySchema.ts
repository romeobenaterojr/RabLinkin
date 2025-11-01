import { z } from "zod";
import { requiredString } from "../util/util";


export const activitySchema = z.object({
  title: requiredString("Title"),
  description: requiredString("Description"),
  category: requiredString("Category"),
  date: z.date({ message: "Date is required" }),
  location: z.object({
    venue: requiredString("Venue"),
    city: z.string().optional(),
    latitude: z.number({ message: "Latitude is required" }),
    longitude: z.number({ message: "Longitude is required" }),
  }),
});

export type ActivitySchema = z.infer<typeof activitySchema>;
