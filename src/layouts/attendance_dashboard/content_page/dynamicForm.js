import React, { useState } from "react";
import {
  TextField,
  Icon,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";

const DynamicForm = ({ formConfig, formData, handleInputChange, handleSubmit, handleClear }) => {
  const [focused, setFocused] = useState({});

  const handleFocus = (name) => {
    setFocused((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (name) => {
    setFocused((prev) => ({ ...prev, [name]: false }));
  };

  const renderFormField = (field) => {
    const { name, label, type, options, required, inputProps } = field;
    const inputLabelProps = {
      shrink: focused[name] || formData[name] || name === "employment_date" || name === "birthdate" ? true : false,
    };
    
    switch (type) {
      case "text":

      case "email":
        return (
          <TextField
            fullWidth
            label={label}
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
            onFocus={() => handleFocus(name)}
            onBlur={() => handleBlur(name)}
            required={required}
            InputLabelProps={inputLabelProps}
            type={type}
            {...inputProps}
          />
        );
        case "select":
        return (
          <TextField
            select
            fullWidth
            label={label}
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
            onFocus={() => handleFocus(name)}
            onBlur={() => handleBlur(name)}
            required={required}
            InputLabelProps={inputLabelProps}
            variant="outlined"
            sx={{
              '& .MuiInputBase-root': {
                height: '56px',
              },
              '& .MuiSelect-select': {
                padding: '16.5px 32px 16.5px 14px',
                height: 'auto !important',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                minHeight: '1.4375em',
                paddingLeft: '14px !important', 
              },
              '& .MuiOutlinedInput-input': {
                padding: 0
              }
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      minHeight: '48px'
                    }
                  }
                }
              }
            }}
          >
            {options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  pl: 2,
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
          case "file":
            return (
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: "56px", textAlign: "left", justifyContent: "flex-start", paddingLeft: 2 }}
              >
                {formData[name]?.name || `📁 ${label}`}
                <input
                  hidden
                  type="file"
                  name={name}
                  accept={field.accept || "image/*"}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name,
                        value: e.target.files[0],
                        file: e.target.files[0],
                      },
                    })
                  }
                />
              </Button>
            );
      case "number":
        return (
          <TextField
            fullWidth
            label={label}
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
            onFocus={() => handleFocus(name)}
            onBlur={() => handleBlur(name)}
            required={required}
            type={type}
            disabled={name === "daily_rate"}
            InputLabelProps={inputLabelProps}
            {...inputProps}
          />
        );
      case "date":
        return (
          <TextField
            fullWidth
            label={label}
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
            onFocus={() => handleFocus(name)}
            onBlur={() => handleBlur(name)}
            required={required}
            type={type}
            InputLabelProps={inputLabelProps}
          />
        );
      case "time-picker":
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileTimePicker
              label={label}
              value={formData[name] ? dayjs(formData[name], "HH:mm") : null}
              onChange={(newValue) => {
                handleInputChange({
                  target: { name, value: newValue ? newValue.format("HH:mm") : "" },
                });
              }}
              ampm={true}
              sx={{ width: "100%"}}
              disabled = {field.readOnly}
            />
          </LocalizationProvider>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        {formConfig.map((field, index) => (
          <Grid item xs={6} key={index}>
            {renderFormField(field)}
          </Grid>
        ))}
      </Grid>
      <Button type="submit" variant="contained" color="primary" sx={{ color: "white !important", mt: 2 }}>
        <Icon>check</Icon>
        &nbsp;Submit
      </Button>
      <Button
        type="button"
        variant="contained"
        onClick={handleClear}
        sx={{
          ml: 2,
          mt: 2,
          color: "white !important",
          backgroundColor: "rgb(255, 165, 0)",
          "&:hover": { backgroundColor: "rgb(255, 140, 0)" },
        }}
      >
        <Icon>clear</Icon>
        &nbsp;Clear
      </Button>
    </form>
  );
};

export default DynamicForm;