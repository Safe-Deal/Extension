import React from "react"
import { render, screen, fireEvent, waitForElementToBeRemoved } from "@testing-library/react"
import { ReviewsImages } from "../Reviews/ReviewsImages"

jest.mock("swiper/react", () => ({
	Swiper: ({ children }) => <div>{children}</div>,
	SwiperSlide: ({ children }) => <div>{children}</div>
}))

describe("ReviewsImages Component", () => {
	const gallery = ["url1.jpg", "url2.jpg", "url3.jpg"]

	it("opens and displays the dialog on image click", () => {
		render(<ReviewsImages gallery={gallery} />)
		fireEvent.click(screen.getByTestId("image-0"))
		expect(screen.getByTestId("image-dialog")).toBeInTheDocument()
	})

	it("navigates to the next image", () => {
		render(<ReviewsImages gallery={gallery} />)
		fireEvent.click(screen.getByTestId("image-0"))
		fireEvent.click(screen.getByTestId("next-img-btn"))
		const img = screen.getByRole("img")
		expect(img).toHaveAttribute("src", gallery[1])
	})

	it("navigates to the next image on image click", () => {
		render(<ReviewsImages gallery={gallery} />)
		fireEvent.click(screen.getByTestId("image-0"))
		fireEvent.click(screen.getByTestId("current-image"))
		const img = screen.getByRole("img")
		expect(img).toHaveAttribute("src", gallery[1])
	})

	it("navigates to the previous image", () => {
		render(<ReviewsImages gallery={gallery} />)
		fireEvent.click(screen.getByTestId("image-2"))
		fireEvent.click(screen.getByTestId("prev-img-btn"))
		const img = screen.getByRole("img")
		expect(img).toHaveAttribute("src", gallery[1])
	})

	it("closes the dialog", async () => {
		render(<ReviewsImages gallery={gallery} />)
		fireEvent.click(screen.getByTestId("image-0"))
		fireEvent.click(screen.getByTestId("close-dialog-btn"))
		await waitForElementToBeRemoved(() => screen.queryByTestId("image-dialog"))
		expect(screen.queryByTestId("image-dialog")).not.toBeInTheDocument()
	})
})
