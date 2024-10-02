import Shepherd from "shepherd.js"
import { isRtl, messages, t } from "../../constants/messages"
import { browserLocalStorage } from "../../utils/site/site-storage"
import "./app-tour.scss"
import { IS_DEBUG } from "../../utils/analytics/logger"

let tour
const rtlLanguages = isRtl()
const TOP_LEVEL_CLASS = "sd-tutorial__container"

const addTutorialClass = () => {
	if (document.body && document.body.classList && !document.body.classList.contains(TOP_LEVEL_CLASS)) {
		document.body.classList.add(TOP_LEVEL_CLASS)
	}
}

const removeTutorialClass = () => {
	if (document.body && document.body.classList && document.body.classList.contains(TOP_LEVEL_CLASS)) {
		document.body.classList.remove(TOP_LEVEL_CLASS)
	}
}

export const Tour = {
	init: () => {
		addTutorialClass()
		tour = new Shepherd.Tour({
			defaultStepOptions: {
				classes: rtlLanguages ? "shepherd-rtl" : "shepherd-ltr",
				cancelIcon: {
					enabled: true
				},
				scrollTo: { behavior: "smooth", block: "center" }
			},
			useModalOverlay: true
		});

		["cancel", "complete"].forEach((event) =>
			tour.on(event, () => {
				removeTutorialClass()
				browserLocalStorage.setItem("isWelcomeDone", "true")
			})
		)
	},
	configureSteps: () => {
		tour.addStep({
			id: "step_1",
			title: messages.tour_step1_title,
			text: messages.tour_step1_text,
			buttons: [
				{
					text: messages.tour_step1_lets_start,
					action: tour.next
				}
			]
		})

		tour.addStep({
			id: "step_2",
			title: messages.tour_step2_title,
			text: messages.tour_step2_text,

			buttons: [
				{
					text: t("back_button"),
					action: tour.back
				},
				{
					text: t("next_button"),
					action: tour.next
				}
			]
		})

		tour.addStep({
			id: "step_3",
			title: messages.tour_step3_title,
			text: messages.tour_step3_text,
			buttons: [
				{
					text: t("back_button"),
					action: tour.back
				},
				{
					text: t("next_button"),
					action: tour.next
				}
			]
		})

		tour.addStep({
			id: "step_4",
			title: messages.tour_step5_title,
			text: messages.tour_step5_text,
			buttons: [
				{
					text: t("back_button"),
					action: tour.back
				},
				{
					text: t("next_button"),
					action: tour.next
				}
			]
		})
		tour.addStep({
			id: "step_5",
			title: messages.tour_feedback_title,
			text: messages.tour_feedback_text,
			buttons: [
				{
					text: t("back_button"),
					action: tour.back
				},
				{
					text: t("start_using_button"),
					action: tour.complete
				}
			]
		})
	},
	start: () => {
		const isDone = browserLocalStorage.getItem("isWelcomeDone")
		if (!isDone || IS_DEBUG) {
			Tour.init()
			Tour.configureSteps()
			tour.start()
		}
	}
}
