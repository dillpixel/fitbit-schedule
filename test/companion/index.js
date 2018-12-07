import schedule from "../../companion"

schedule.add({
	data: "Lunch time!",
	due: {
		times: ["12:00"],
		days: [0, 1, 2, 3, 4, 5, 6, 7]
	}
})

schedule.ondue = event => {
	console.log(event.data) // Lunch time!
}
