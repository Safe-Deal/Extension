import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { PinButton } from "../PinButton"

describe("PinButton", () => {
	it("displays the PushPinIcon when isPinned is true", () => {
		render(<PinButton isPinned onClick={() => {}} />)
		expect(screen.getByLabelText(/click_to_unpin/i)).toBeInTheDocument()
	})

	it("displays the PushPinOutlinedIcon when isPinned is false", () => {
		render(<PinButton isPinned={false} onClick={() => {}} />)
		expect(screen.getByLabelText(/click_to_pin/i)).toBeInTheDocument()
	})

	it("calls onClick when the button is clicked", async () => {
		const handleClick = jest.fn()
		render(<PinButton isPinned={false} onClick={handleClick} />)
		await userEvent.click(screen.getByLabelText(/click_to_pin/i))
		expect(handleClick).toHaveBeenCalledTimes(1)
	})
})
