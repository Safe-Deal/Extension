import { useCallback, useEffect, useRef } from "react"

export const useLazyLoad = () => {
	const observer = useRef(null)

	const handleObserver = useCallback((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const img = entry.target
				img.src = img.dataset.src
				observer.current.unobserve(img)
			}
		})
	}, [])

	useEffect(() => {
		observer.current = new IntersectionObserver(handleObserver, {
			root: null,
			rootMargin: "0px",
			threshold: 0.1
		})
		const images = document.querySelectorAll("[data-src]")
		images.forEach((image) => observer.current.observe(image))

		return () => observer.current.disconnect()
	}, [handleObserver])
}
