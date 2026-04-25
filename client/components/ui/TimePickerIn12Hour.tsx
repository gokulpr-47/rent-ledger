'use client';

import React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';

interface TimePickerIn12HourProps {
  label?: string;
  value: string; // Format: "HH:mm" (24-hour from datetime-local)
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

/**
 * Converts 24-hour time to 12-hour format
 * Input: "14:30" -> Output: { hours: "02", minutes: "30", period: "PM" }
 */
const timeTo12Hour = (time24: string) => {
  if (!time24) return { hours: '12', minutes: '00', period: 'AM' };

  const [h, m] = time24.split(':');
  let hour = parseInt(h, 10);
  const minute = m || '00';
  let period = 'AM';

  if (hour >= 12) {
    period = 'PM';
    if (hour > 12) hour -= 12;
  }
  if (hour === 0) hour = 12;

  return {
    hours: String(hour).padStart(2, '0'),
    minutes: String(minute).padStart(2, '0'),
    period,
  };
};

/**
 * Converts 12-hour time to 24-hour format
 * Input: { hours: "02", minutes: "30", period: "PM" } -> Output: "14:30"
 */
const timeTo24Hour = (hours: string, minutes: string, period: string) => {
  let h = parseInt(hours || '0', 10) || 0;
  let m = parseInt(minutes || '0', 10) || 0;

  // Handle invalid values
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;

  if (period === 'PM' && h !== 12) {
    h += 12;
  } else if (period === 'AM' && h === 12) {
    h = 0;
  }

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export default function TimePickerIn12Hour({
  label = 'Time',
  value,
  onChange,
  error = false,
  helperText,
  required = false,
}: TimePickerIn12HourProps) {
  const { hours, minutes, period } = timeTo12Hour(value);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = e.target.value;
    // Allow empty input for clearing
    if (h === '') {
      const newTime24 = timeTo24Hour('', minutes, period);
      onChange(newTime24);
      return;
    }
    const num = parseInt(h, 10);
    if (isNaN(num)) return;
    if (num < 1 || num > 12) return; // Reject invalid hours
    const newTime24 = timeTo24Hour(h, minutes, period);
    onChange(newTime24);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = e.target.value;
    // Allow empty input for clearing
    if (m === '') {
      const newTime24 = timeTo24Hour(hours, '', period);
      onChange(newTime24);
      return;
    }
    const num = parseInt(m, 10);
    if (isNaN(num)) return;
    if (num < 0 || num > 59) return; // Reject invalid minutes
    const newTime24 = timeTo24Hour(hours, m, period);
    onChange(newTime24);
  };

  const handlePeriodChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const p = e.target.value as string;
    const newTime24 = timeTo24Hour(hours, minutes, p);
    onChange(newTime24);
  };

  return (
    <FormControl fullWidth error={error} size="small">
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          label="HH"
          type="number"
          value={hours}
          onChange={handleHourChange}
          inputProps={{
            min: 1,
            max: 12,
            step: 1,
          }}
          size="small"
          sx={{ width: '60px' }}
        />
        <div style={{ paddingTop: '4px', fontWeight: 600 }}>:</div>
        <TextField
          label="MM"
          type="number"
          value={minutes}
          onChange={handleMinuteChange}
          inputProps={{
            min: 0,
            max: 59,
            step: 1,
          }}
          size="small"
          sx={{ width: '60px' }}
        />
        <Select
          value={period}
          onChange={handlePeriodChange}
          size="small"
          sx={{ width: '80px' }}
        >
          <MenuItem value="AM">AM</MenuItem>
          <MenuItem value="PM">PM</MenuItem>
        </Select>
      </Stack>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
