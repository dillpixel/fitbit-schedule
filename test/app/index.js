import schedule from "../../app"

schedule.add({
	data: "Lunch time!",
	due: {
		times: ["00:03", "00:04", "00:05"],
		days: [0, 1, 2, 3, 4, 5, 6, 7]
	}
})

schedule.ondue = event => {
	console.log(event.data) // Lunch time!
}

schedule.onmissed = even => {
	console.log("MISS!")
}
