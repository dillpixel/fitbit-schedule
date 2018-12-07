import { readFileSync, writeFileSync } from "fs"

const debug = false

const get_events = () => {
  try {
    return readFileSync("_schedule_events", "cbor")
  } catch (error) {
    debug && console.log(error)
    return {}
  }
}

const set_events = events => {
  writeFileSync("_schedule_events", events, "cbor")
}

//====================================================================================================
// Functions
//====================================================================================================

const add = (event) => {
  debug && console.log("Add Event --> " + JSON.stringify(event))
  // Set defaults
  event = event || {}
  event.due = event.due || Date.now()
  event.tolerance = event.tolerance || 900000
  // Set internal values
  event._id = id = Math.floor(Math.random() * 10000000000000000) // Random 16-digit number
  event._timeout_id = trigger(event)
  // If the timeout is valid
  if (event._timeout_id) {
    const events = get_events()
    events[event._id] = event
    set_events(events)
    return event._id
  } else {
    return false
  }
}

const remove = id => {
  debug && console.log("Remove Event --> " + JSON.stringify(event))
  const events = get_events()
  // If an ID is specified
  if (id && events[id]) {
    // Clear the event timeout
    clearTimeout(events[id]._timeout_id)
    // Remove the event
    delete events[id]
    set_events(events)
  }
  // If no ID is specified
  else {
    // Clear all event timeouts
    for (let id in events) {
      clearTimeout(events[id]._timeout_id)
    }
    // Remove all events
    set_events({})
  }
}

const trigger = event => {
  debug && console.log("Trigger --> " + JSON.stringify(event))
  let due = event.due
  let timeout = 9999999999999
  // If this is a non-recurring event
  if (typeof event.due == "number") {
    timeout = event.due - Date.now()
  }
  // If this is a recurring event that was previously triggered
  else if (event._due) {
    timeout = event._due - Date.now()
  }
  // If this is a recurring event that was not previously triggered
  else {
    const now = new Date()
    const times = event.due.times || ["12:00:"]
    const days = event.due.days || [0, 1, 2, 3, 4, 5, 6]
    let min_difference = 9999999999999
    // Iterate over the next seven days
    for (let i = 0; i <= 7; i++) {
      // Create a test date
      const test_date = new Date()
      test_date.setDate(test_date.getDate() + i)
      // If the test date lands on one of the scheduled days
      if (days.indexOf(test_date.getDay()) > -1) {
        // Iterate over the scheduled times
        for (let time of times) {
          const [hours, minutes] = time.split(":")
          // Set the time of the test date
          test_date.setHours(hours)
          test_date.setMinutes(minutes)
          test_date.setSeconds(0)
          test_date.setMilliseconds(0)
          // Calculate the difference between now and the test date
          const difference = test_date - now
          // If the test date is the nearest future date encountered so far
          if (difference > 0 && difference < min_difference) {
            due = test_date.getTime()
            min_difference = difference
          }
        }
      }
    }
    timeout = min_difference
  }
  // Set the internal due date (always a UNIX timestamp in milliseconds)
  event._due = due
  // Set the timer
  const timeout_id = setTimeout(() => {
    const difference = Date.now() - event._due
    if (difference > 0 || Math.abs(difference) < event.tolerance) {
      schedule.ondue(event)
    } else {
      schedule.onmissed(event)
    }
    // If this is a recurring event
    if (typeof event.due == "object") {
      // Reset the internal due date
      delete event._due
      // Retrigger the event
      trigger(event)
    }
    // If this is a non-recurring event
    else {
      // Remove the event
      remove(event._id)
    }
  }, timeout)
  return timeout_id
}

//====================================================================================================
// Startup
//====================================================================================================

const events = get_events()
debug && console.log("Cached Events --> " + JSON.stringify(events))

// Retrigger all cached events
for (let id in events) {
  debug && console.log("Retrigger Event --> " + JSON.stringify(events[id]))
  events[id]._timeout_id = trigger(events[id])
}

set_events(events)

//====================================================================================================
// Export
//====================================================================================================

const schedule = {
  add: add,
  remove: remove,
  ondue: () => {},
  onmissed: () => {}
}

export default schedule
