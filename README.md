# Fitbit Schedule
Fitbit Schedule allows you to schedule persistent recurring and non-recurring events on Fitbit OS. This module is useful for reminders, timers, and other events that need to survive changes in the app life cycle. It also provides a method for handling missed events (e.g. if the event comes due when the device is off or another app is running).
## Usage
This module assumes you're using the [Fitbit CLI](https://dev.fitbit.com/build/guides/command-line-interface/) in your workflow, which allows you to manage packages using [npm](https://docs.npmjs.com/about-npm/).
#### Installation
```
npm i fitbit-schedule
```
Fitbit Schedule has a uniform API that works on both the app and the companion. The only difference is the module name in the import statement, which is `fitbit-schedule/app` for the app and `fitbit-schedule/companion` for the companion.
#### Examples
A non-recurring event can be scheduled by supplying the `due` parameter with a UNIX timestamp (in milliseconds).
```javascript
import schedule from "fitbit-schedule/app"

schedule.add({
  data: "See you in an hour...",
  due: Date.now() + 3600000
})

schedule.ondue = event => {
  console.log(event.data) // See you in an hour...
}
```
A recurring event can be scheduled by supplying the `due` parameter with an object that describes the recurrence pattern. Currently, only weekly patterns are supported.
```javascript
import schedule from "fitbit-schedule/app"

schedule.add({
  data: "Lunch time!",
  due: {
    times: ["12:00"],
    days: [0, 1, 2, 3, 4, 5, 6]
  }
})

schedule.ondue = event => {
  console.log(event.data) // Lunch time!
}
```
## API
#### `schedule.add(event)`
Add a new event. Returns the event ID.
##### `event` **Object**
The event to be created.
###### `event.data` **Any**
The data contained within the event.
###### `event.due` **Number** or **Object**
The time at which the event should be triggered. For a non-recurring event, `due` should be a UNIX timestamp in milliseconds. For a recurring event, `due` should be an object with the following properties:
 * `times` An array of 24-hour time strings in the format `HH:MM`. The default is `12:00`.
 * `dates` An array of days of the week, where 0 = Sunday, 1 = Monday, etc. The default is `[0, 1, 2, 3, 4, 5, 6]`.
###### `event.tolerance` **Number**
The amount of acceptable delay in milliseconds. It may not always be possible to trigger the event at the exact time specified by the `due` parameter (e.g. if the device is turned off or another app is running). If an event is past due when the app repoens, the `ondue` handler will be called only if the time elapsed since `due` is less than `tolerance`. Otherwise, the `onmissed` handler will be called. The default tolerance is `900000` (15 minutes).
#### `schedule.remove(id)`
Remove an event. If `id` is omitted, all events are removed.
##### `id` **Number**
The ID of the event to be deleted.
#### `schedule.ondue = event => { ... }`
Called when an event comes due.
#### `schedule.onmissed = event => { ... }`
Called when an event is missed.
