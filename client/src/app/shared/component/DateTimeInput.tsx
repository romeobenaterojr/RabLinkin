import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";
import { DateTimePicker } from "@mui/x-date-pickers";


type Props<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
};

export default function DateTimeInput<T extends FieldValues>({ control, name, label }: Props<T>) {
  const { field, fieldState } = useController<T>({ control, name });

  const value = field.value as unknown as Date | null;

  return (
    <DateTimePicker
      value={value ?? new Date()}
      onChange={(date) => date && field.onChange(date)}
      slotProps={{
        textField: {
          label,
          onBlur: field.onBlur,
          error: !!fieldState.error,
          helperText: fieldState.error?.message,
          fullWidth: true,
        },
      }}
    />
  );
}
