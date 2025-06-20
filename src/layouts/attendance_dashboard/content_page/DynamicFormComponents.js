import React from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Icon, 
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  OutlinedInput
} from "@mui/material";
import { styled } from '@mui/material/styles';

// Styled Select component for consistent sizing
const UniformSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '16.5px 14px',
    height: '1.4375em' // Match TextField height
  },
  '& .MuiOutlinedInput-input': {
    padding: '16.5px 14px'
  }
}));

// Styled TextField for date inputs
const DateTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    padding: '16.5px 14px'
  }
});

export const DynamicTextField = ({
  name,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  fullWidth = true,
  margin = 'normal',
  variant = 'outlined',
  size = 'medium',
  InputProps = {},
  startAdornment,
  endAdornment,
  icon,
  ...props
}) => {
  const adornmentConfig = {
    ...(startAdornment && {
      startAdornment: (
        <InputAdornment position="start">
          {typeof startAdornment === 'string' ? (
            <Icon>{startAdornment}</Icon>
          ) : (
            startAdornment
          )}
        </InputAdornment>
      )
    }),
    ...(endAdornment && {
      endAdornment: (
        <InputAdornment position="end">
          {typeof endAdornment === 'string' ? (
            <Icon>{endAdornment}</Icon>
          ) : (
            endAdornment
          )}
        </InputAdornment>
      )
    })
  };

  // Use DateTextField for date types
  const TextFieldComponent = type === 'date' ? DateTextField : TextField;

  return (
    <TextFieldComponent
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      fullWidth={fullWidth}
      margin={margin}
      variant={variant}
      size={size}
      InputProps={{
        ...adornmentConfig,
        ...InputProps,
      }}
      {...props}
    />
  );
};

export const DynamicSelect = ({
    name,
    label,
    value,
    onChange,
    options = [],
    required = false,
    fullWidth = true,
    margin = 'normal',
    size = 'medium',
    variant = 'outlined', // Added to match TextField
    ...props
  }) => (
    <FormControl 
      fullWidth={fullWidth} 
      margin={margin} 
      size={size}
      variant={variant} // Added to match TextField
    >
      <InputLabel>{label}</InputLabel>
      <Select
        name={name}
        value={value}
        label={label}
        onChange={onChange}
        required={required}
        variant={variant} // Added to match TextField
        fullWidth={fullWidth}
        input={<OutlinedInput label={label} />}
        sx={{
          '& .MuiSelect-select': {
            padding: '16.5px 14px',
            height: '1.4375em' // Match TextField height
          },
          '& .MuiOutlinedInput-input': {
            padding: '16.5px 14px'
          }
        }}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

export const DynamicDateField = ({
  name,
  label,
  value,
  onChange,
  required = false,
  fullWidth = true,
  margin = 'normal',
  ...props
}) => (
  <DateTextField
    name={name}
    label={label}
    type="date"
    value={value}
    onChange={onChange}
    required={required}
    fullWidth={fullWidth}
    margin={margin}
    InputLabelProps={{
      shrink: true,
    }}
    {...props}
  />
);

// ... rest of the components remain the same ...

export const DynamicButton = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  ...props
}) => (
  <Button
    variant={variant}
    color={color}
    size={size}
    startIcon={startIcon && !loading ? <Icon>{startIcon}</Icon> : null}
    endIcon={endIcon && !loading ? <Icon>{endIcon}</Icon> : null}
    onClick={onClick}
    type={type}
    fullWidth={fullWidth}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? 'Loading...' : children}
  </Button>
);

export const DynamicCheckbox = ({
  name,
  label,
  checked,
  onChange,
  color = 'primary',
  ...props
}) => (
  <FormControlLabel
    control={
      <Checkbox
        name={name}
        checked={checked}
        onChange={onChange}
        color={color}
        {...props}
      />
    }
    label={label}
  />
);

export const DynamicRadioGroup = ({
  name,
  value,
  onChange,
  options = [],
  row = false,
  label,
  ...props
}) => (
  <FormControl component="fieldset">
    {label && <Typography variant="subtitle2">{label}</Typography>}
    <RadioGroup
      name={name}
      value={value}
      onChange={onChange}
      row={row}
      {...props}
    >
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio color="primary" />}
          label={option.label}
        />
      ))}
    </RadioGroup>
  </FormControl>
);

export const FormSection = ({ title, children, spacing = 2, ...props }) => (
  <Box mb={4} {...props}>
    {title && (
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
    )}
    <Box display="flex" flexDirection="column" gap={spacing}>
      {children}
    </Box>
  </Box>
);

export const FormActions = ({ children, justify = 'flex-end', spacing = 2, ...props }) => (
  <Box display="flex" justifyContent={justify} gap={spacing} mt={3} {...props}>
    {children}
  </Box>
);