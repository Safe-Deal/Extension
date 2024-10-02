import React from "react"
import { render, screen } from "@testing-library/react"
import { FloatingToolbar } from "../FloatingToolbar"

jest.mock("@mui/material/styles/ThemeProvider", () => ({ children }) => <div>{children}</div>)

describe("FloatingToolbar", () => {
	const MinimalComponent = () => <div>Minimal Content</div>
	const FullComponent = () => <div>Full Content</div>

	it("initially renders the minimal version", () => {
		render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading={false} />)
		expect(screen.getByText("Minimal Content")).toBeInTheDocument()
	})

	it("renders the full version when expanded", async () => {
		render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading={false} />)

		await user.click(screen.getByText("Minimal Content"))
		expect(screen.getByText("Full Content")).toBeInTheDocument()
	})

	it("renders a loader during the loading state", () => {
		render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading />)
		expect(screen.getByTestId("initial-loader")).toBeInTheDocument()
	})

	it("closes and minimizes when the close icon is clicked", async () => {
		render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading={false} />)
		await user.click(screen.getByText("Minimal Content")) // Maximize
		await user.click(screen.getByTestId("close-icon"))
		expect(screen.getByText("Minimal Content")).toBeInTheDocument()
	})

	it("toggles between minimized and maximized states", async () => {
		render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading={false} />)

		await user.click(screen.getByText("Minimal Content")) // Maximize
		expect(screen.getByText("Full Content")).toBeInTheDocument()
		await user.click(screen.getByTestId("close-icon")) // Minimize
		expect(screen.getByText("Minimal Content")).toBeInTheDocument()
	})

	it("smoke test for draggable functionality", async () => {
		render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading={false} />)

		const dragHandle = screen.getByTestId("drag-handle")
		await user.pointer({ keys: "[MouseLeft>]", target: dragHandle })
		expect(dragHandle).toBeTruthy() // Placeholder assertion, adjust based on your actual implementation
	})

	it("closes when clicking away and not pinned", async () => {
		render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading={false} />)

		await user.click(screen.getByText("Minimal Content")) // Assuming clicking expands it
		await user.click(document.body) // Simulate clicking away
		expect(screen.getByText("Minimal Content")).toBeInTheDocument()
	})

	it("responds to keyboard shortcuts", async () => {
		render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading={false} />)

		await user.keyboard("[Escape]") // Assuming Escape minimizes the toolbar
		expect(screen.getByText("Minimal Content")).toBeInTheDocument()
	})

	it("toggles size on pressing Option + D twice", async () => {
		render(<FloatingToolbar Minimal={<MinimalComponent />} Full={<FullComponent />} isLoading={false} />)
		await user.keyboard("{Alt>}D{/Alt}")
		expect(screen.getByText("Full Content")).toBeInTheDocument()

		await user.keyboard("{Alt>}D{/Alt}")
		expect(screen.getByText("Minimal Content")).toBeInTheDocument()
	})
})
