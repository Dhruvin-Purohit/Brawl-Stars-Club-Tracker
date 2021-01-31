# Brawl Stars Club Tracker
Track a brawl stars club using it's club tag and the [Brawl Stars API](https://developer.brawlstars.com/ "Brawl Stars API")

## Menu
* [Features](##features)
* [Getting Started](##getting-started)
    * [JavaScript](###javascript)
    * [TypeScript](###typescript)
* [Coming Soon](##coming-soon)

## Features
Supports [Royale API Proxy](https://docs.royaleapi.com/#/proxy "Royale API Proxy")
Supports [TypeScript](https://typescriptlang.org "TypeScript")

## Getting Started
Instantiate the Tracker Class and then use it!

### JavaScript
```js
const { Tracker } = require('brawl-stars-club-tracker');

let clubTag = '#00ff00';

let clubTracker = new Tracker(clubTag, {
	token: '-- Token --',
	useProxy: false,
	ratelimit: 2, //fetch 2 times every second (1 time every 0.5 seconds)
});
clubTracker.init();
clubTracker.once('ready', (tracker) => {
	tracker.on('clubNameUpdate', (oldData, newData) => {
		console.log(`CLub Name changed: ${oldData.name} => ${newData.name}`);
	});
	tracker.on('error', (err) => {
		console.error(err);
	});
});

```

### TypeScript
```ts
import { Tracker } from 'brawl-stars-club-tracker';

let clubTag = '#00ff00';

let clubTracker = new Tracker(clubTag, {
	token: '-- Token --',
	useProxy: true,
	ratelimit: 0.2, //fetch 0.2 times every second (1 time every 5 seconds)
});
clubTracker.init();
clubTracker.once('ready', (tracker: Tracker) => {
	tracker.on('clubNameUpdate', (oldData, newData) => {
		console.log(`CLub Name changed: ${oldData.name} => ${newData.name}`);
	});
	tracker.on('error', (err: Error) => {
		console.error(err);
	});
});
```

## Coming Soon
* Documentation
