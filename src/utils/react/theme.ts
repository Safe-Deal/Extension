import { createTheme } from "@mui/material/styles";
import { Z_INDEX_MAX } from "../../e-commerce/client/components/constants";

export const SafeDealTheme = createTheme({
  palette: {
    secondary: {
      main: "#f1f5f9",
      contrastText: "#424242",
      dark: "#e0e4e8"
    }
  },
  components: {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          zIndex: Z_INDEX_MAX,
          position: "fixed"
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#f5f5f5",
          color: "#424242",
          maxWidth: 800,
          border: "1px solid #dadde9",
          fontSize: "12px"
        },
        popper: {
          zIndex: Z_INDEX_MAX
        }
      }
    },
    MuiTablePagination: {
      styleOverrides: {
        displayedRows: {
          margin: "0"
        }
      }
    }
  }
});
