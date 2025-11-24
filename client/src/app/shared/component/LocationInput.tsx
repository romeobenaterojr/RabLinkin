import { useEffect, useMemo, useState } from "react";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { Box, debounce, List, ListItemButton, TextField, Typography } from "@mui/material";
import axios from "axios";

type Props<T extends FieldValues> = {
  label: string;
} & UseControllerProps<T>;

export default function LocationInput<T extends FieldValues>(props: Props<T>) {
  const { field, fieldState } = useController({ ...props });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationIQSuggestion[]>([]);
  const [inputValue, setInputValue] = useState(() => {
    if (field.value && typeof field.value === "object") return field.value.venue || "";
    return field.value || "";
  });

  useEffect(() => {
    if (field.value && typeof field.value === "object") {
      setInputValue(field.value.venue || "");
    } else {
      setInputValue(field.value || "");
    }
  }, [field.value]);

  const locationURL = "https://api.locationiq.com/v1/autocomplete?key=pk.4a9f22393cf2370f01e0d245bb88bd85&limit=5&dedupe=1&";

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query || query.length < 3) {
          setSuggestions([]);
          return;
        }
        setLoading(true);
        try {
          const res = await axios.get<LocationIQSuggestion[]>(`${locationURL}q=${query}`);
          setSuggestions(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }, 500),
    [locationURL]
  );

  const handleChange = (value: string) => {
    setInputValue(value);
    field.onChange(value);
    fetchSuggestions(value);
  };

  const handleSelect = (location: LocationIQSuggestion) => {
    const city = location.address?.city || location.address?.town || location.address?.village || "";
    const venue = location.display_name;
    const latitude = parseFloat(location.lat);
    const longitude = parseFloat(location.lon);

    setInputValue(venue);
    field.onChange({ venue, city, latitude, longitude });
    setSuggestions([]);
  };

  return (
    <Box>
      <TextField
        {...props}
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        fullWidth
        variant="outlined"
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
      />
      {loading && <Typography>Loading...</Typography>}
      {suggestions.length > 0 && (
        <List sx={{ border: 1 }}>
          {suggestions.map((suggestion) => (
            <ListItemButton key={suggestion.place_id} divider onClick={() => handleSelect(suggestion)}>
              {suggestion.display_name}
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}
