import { IDiffDate } from "../../data/entities/diff-date.interface"

export const isToday = (compare) => {
	if (compare) {
		const someDate = new Date(compare)
		const today = new Date()
		return (
			someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
		)
	}
	return false
}

export const getUtcTimestamp = () => {
	const today = new Date()
	return today.getTime()
}

export const getDiffInSeconds = (date1, date2) => {
	const diff = Math.abs(date1 - date2)
	return diff / 1000
}

export const getDiffInDays = (date1, date2) => {
	const diff = Math.abs(date1 - date2)
	return diff / (1000 * 60 * 60 * 24)
}

export const calculateDatesRange = (date1: Date, date2: Date): IDiffDate => {
	const diffTime = Math.abs(date2.getTime() - date1.getTime())
	const dayDiff = diffTime / (1000 * 60 * 60 * 24)
	const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30)
	const yearDiff = Math.floor(diffMonths / 12)
	const monthDiff = Math.floor(diffMonths % 12)
	const roundYearDiff = Math.round(diffMonths / 12)
	return {
		yearDiff,
		monthDiff,
		dayDiff,
		roundYearDiff
	}
}

export const DateUtils = {
	isToday,
	getUtcTimestamp,
	getDiffInSeconds,
	getDiffInDays
}
