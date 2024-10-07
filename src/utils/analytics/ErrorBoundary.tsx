import React, { Component, ErrorInfo, ReactNode } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { debug, IS_DEBUG, logError } from "./logger";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (IS_DEBUG) {
      this.setState({ error, errorInfo });
    } else {
      debug({ name: "ErrorBoundary", error, errorInfo });
    }
  }

  handleClose = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (IS_DEBUG) {
        return (
          <Dialog
            open
            onClose={this.handleClose}
            aria-labelledby="error-dialog-title"
            PaperProps={{
              style: {
                width: "60%",
                maxWidth: "none"
              }
            }}
          >
            <DialogTitle id="error-dialog-title">
              Safe Deal - Error Occurred
              <IconButton
                aria-label="close"
                onClick={this.handleClose}
                style={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers style={{ textAlign: "left" }}>
              <Typography style={{ color: "red" }}>{this.state.error?.toString() ?? "Unknown Error"}</Typography>
              {this.state.errorInfo && (
                <Typography style={{ marginTop: "20px", color: "gray", fontSize: "0.8em" }}>
                  {this.state.errorInfo.componentStack}
                </Typography>
              )}
            </DialogContent>
          </Dialog>
        );
      }
      const error = new Error(this.state.error?.toString() ?? `Unknown Error${this.state.errorInfo?.componentStack}`);
      logError(error, "React - Error Boundary");
      return null;
    }

    return this.props.children;
  }
}
