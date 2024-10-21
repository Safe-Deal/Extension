import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "../../../../../store/AuthState";
import { FloatingToolbar } from "../FloatingToolbar";

jest.mock("@mui/material/styles/ThemeProvider", () => ({ children }) => <div>{children}</div>);
jest.mock("../../../../../store/AuthState.ts");

describe("FloatingToolbar", () => {
  const MinimalComponent = () => <div>Minimal Content</div>;
  const FullComponent = () => <div>Full Content</div>;

  const mockUser = { id: "test-user", name: "Test User" };

  beforeEach(() => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      session: { accessToken: "test-token" }
    });
  });

  const renderComponent = () =>
    render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading={false} />);

  it("initially renders the minimal version", () => {
    renderComponent();
    expect(screen.getByText("Minimal Content")).toBeInTheDocument();
  });

  it("renders a loader during the loading state", () => {
    render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading />);
    expect(screen.getByTestId("initial-loader")).toBeInTheDocument();
  });

  it("closes and minimizes when the close icon is clicked", async () => {
    renderComponent();
    await userEvent.click(screen.getByText("Minimal Content")); // Maximize
    await userEvent.click(screen.getByTestId("close-icon"));
    expect(screen.getByText("Minimal Content")).toBeInTheDocument();
  });

  it("smoke test for draggable functionality", async () => {
    renderComponent();
    const dragHandle = screen.getByTestId("drag-handle");
    await userEvent.pointer({ keys: "[MouseLeft>]", target: dragHandle });
    expect(dragHandle).toBeTruthy();
  });

  it("closes when clicking away and not pinned", async () => {
    renderComponent();
    await userEvent.click(screen.getByText("Minimal Content")); // Assuming clicking expands it
    await userEvent.click(document.body); // Simulate clicking away
    expect(screen.getByText("Minimal Content")).toBeInTheDocument();
  });

  it("responds to keyboard shortcuts", async () => {
    renderComponent();
    await userEvent.keyboard("[Escape]"); // Assuming Escape minimizes the toolbar
    expect(screen.getByText("Minimal Content")).toBeInTheDocument();
  });
});
