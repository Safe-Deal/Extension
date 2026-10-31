import { createTheme } from "@mui/material/styles";
import { Z_INDEX_MAX } from "../../e-commerce/client/components/constants";

export const SERIES_COLORS = ["#00a660", "#ff9800", "#f44336", "#2196f3", "#9c27b0", "#795548", "#607d8b", "#ff5722"];

const baseComponents = (mode: "light" | "dark") => ({
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
        backgroundColor: mode === "dark" ? "#111827" : "#f5f5f5",
        color: mode === "dark" ? "#e5e7eb" : "#424242",
        maxWidth: 800,
        border: `1px solid ${mode === "dark" ? "#1f2937" : "#dadde9"}`,
        fontSize: "12px"
      },
      popper: {
        zIndex: Z_INDEX_MAX
      }
    }
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        backgroundColor: mode === "dark" ? "#0f172a" : "#fff",
        color: mode === "dark" ? "#e5e7eb" : "#111827",
        border: `1px solid ${mode === "dark" ? "#1f2937" : "#e5e7eb"}`
      }
    }
  },
  MuiPopover: {
    styleOverrides: {
      paper: {
        backgroundColor: mode === "dark" ? "#0f172a" : "#fff",
        color: mode === "dark" ? "#e5e7eb" : "#111827",
        border: `1px solid ${mode === "dark" ? "#1f2937" : "#e5e7eb"}`
      }
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: mode === "dark" ? "#0f172a" : "#fff",
        color: mode === "dark" ? "#e5e7eb" : "#111827"
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
});

export const getSafeDealTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      secondary: {
        main: mode === "dark" ? "#111827" : "#f1f5f9",
        contrastText: mode === "dark" ? "#e5e7eb" : "#424242",
        dark: mode === "dark" ? "#0b1220" : "#e0e4e8"
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components: baseComponents(mode) as any
  });
