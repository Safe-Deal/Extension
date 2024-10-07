import React, { useRef, useEffect, useState } from "react";
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
  const [inputWidth, setInputWidth] = useState("250px");
  const spanRef = useRef(null);

  const handleTextChange = (event) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    setText(debouncedInputValue);
  }, [debouncedInputValue, setText]);

  useEffect(() => {
    if (spanRef.current) {
      setInputWidth(`${spanRef.current.offsetWidth + 28}px`);
    }
  }, [inputValue]);

  return (
    <Box sx={{ display: "inline-block" }}>
      <TextField
        variant="outlined"
        value={inputValue}
        onChange={handleTextChange}
        sx={{
          width: inputWidth,
          ml: 1,
          marginBottom: "2px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "grey"
            },
            "&:hover fieldset": {
              borderColor: "darkgrey"
            },
            "&.Mui-focused fieldset": {
              borderColor: "grey"
            }
          }
        }}
      />
      <span
        ref={spanRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre",
          fontSize: "18px",
          fontFamily: "Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        {inputValue || " "}
      </span>
    </Box>
  );
};

export default ProductNameTextBox;
