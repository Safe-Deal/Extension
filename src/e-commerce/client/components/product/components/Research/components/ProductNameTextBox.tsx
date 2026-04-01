import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useDebounce } from "../../../../../hooks/useDebounce";

interface ProductNameTextBoxProps {
  text: string;
  setText: (text: string) => void;
}

const TYPING_DEBOUNCE_MS = 450;

const ProductNameTextBox = ({ text, setText }: ProductNameTextBoxProps) => {
  const [inputValue, setInputValue] = useState(text);
  const debouncedInputValue = useDebounce(inputValue, TYPING_DEBOUNCE_MS);

  const handleTextChange = (event) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    setInputValue(text);
  }, [text]);

  useEffect(() => {
    setText(debouncedInputValue);
  }, [debouncedInputValue, setText]);

  return (
    <Box sx={{ width: "min(360px, 46vw)", maxWidth: "100%" }}>
      <TextField
        variant="outlined"
        size="small"
        value={inputValue}
        onChange={handleTextChange}
        sx={{
          width: "100%",
          "& .MuiInputBase-input": {
            fontSize: "13px",
            padding: "9px 10px"
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#fff",
            "& fieldset": {
              borderColor: "#d8dee7"
            },
            "&:hover fieldset": {
              borderColor: "#b8c2cf"
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1f6feb"
            }
          }
        }}
      />
    </Box>
  );
};

export default ProductNameTextBox;
