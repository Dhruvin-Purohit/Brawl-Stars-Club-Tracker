const { throws } = require('assert');
const EventEmitter = require('events');
const fetch = require('node-fetch');

class Tracker extends EventEmitter {
	/**
	 * The Tracker itself.
	 * @param {String} tag The Club Tag of the club
	 * @param {TrackerOptions} options The options for the tracker
	 */
	constructor(tag, options = {}) {
		super();

		const { token, useProxy = false, ratelimit = 1 } = options;

		/**
		 * The Club Tag of the club
		 * @type {String}
		 */
		this.tag = tag.toUpperCase().replace(/#/g, '').replace(/O/g, '0');

		/**
		 * The Brawl Stars API Token
		 * @type {String}
		 * @see https://developer.brawlstars.com/
		 */
		this.token = token;

		/**
		 * Wheter or not to use RoyaleAPI Proxy
		 * @type {Boolean}
		 * @default false
		 * @see https://docs.royaleapi.com/#/proxy
		 */
		this.useProxy = useProxy;

		this.data;

		this.ratelimit = ratelimit;
	}

	/**
	 * Fetch the api for this clan (Private method not be used)
	 * @private
	 */
	get _fetch() {
		if (this.useProxy) {
			let res = await fetch(
				`https://bsproxy.royaleapi.dev/v1/players/%23${this.tag}`,
				{ headers: { Authorization: `Bearer ${this.token}` } },
			);
			let json = await res.json();
			return {
				res: res,
				json: json,
			};
		}
		let res = await fetch(
			`https://api.brawlstars.com/v1/players/%23${this.tag}`, //iirc that's the link i am not sure tho will look this one up
			{ headers: { Authorization: `Bearer ${this.token}` } },
		);
		let json = await res.json();
		return {
			res: res,
			json: json,
		};
	}

	/**
	 * Waits for the sepcific time before going ahead (Private method not be used)
	 * @param {Number} ms The time for which to wait
	 * @private
	 */
	async _sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	/**
	 * The main thing, does all checks, fetches and emits events accordingly
	 * @private
	 */
	async _main() {
		let oldData = this.data;
		if (oldData) {
			let newData = await this._fetch.json;
			if (newData.res.status === 200) {
				if (!oldData === newData) {
					//The start of the tracker
					if (!oldData.name === newData.name) {
						this.emit('clubNameUpdate', oldData, newData, this);
					}
					if (!oldData.description === newData.description) {
						this.emit(
							'clubDescriptionUpdate',
							oldData,
							newData,
							this,
						);
					}
					if (!oldData.type === newData.type) {
						this.emit('clubTypeUpdate', oldData, newData, this);
					}
					if (!oldData.badgeId === newData.badgeId) {
						this.emit('clubBadgeUpdate', oldData, newData, this);
					}
					if (
						!oldData.requiredTrophies === newData.requiredTrophies
					) {
						this.emit(
							'clubRequiredTrophiesUpdate',
							oldData,
							newData,
							this,
						);
					}
					if (!oldData.members === newData.members) {
						let memberssJoin = newData.members.filter(
							(f) =>
								!oldData.members.some((d) => d.tag === f.tag),
						);
						if (memberssJoin.length > 0) {
							for (let member of memberssJoin) {
								this.emit(
									'clubMemberAdd',
									member,
									oldData,
									newData,
									this,
								);
							}
						}
						let memberssLeft = oldData.members.filter(
							(f) =>
								!newData.members.some((d) => d.tag === f.tag),
						);
						if (memberssLeft.length > 0) {
							for (let member of memberssLeft) {
								this.emit(
									'clubMemberRemove',
									member,
									oldData,
									newData,
									this,
								);
							}
						}
					}
					if (!oldData.members === newData.members) {
						let memberss = oldData.members.filter((f) =>
							newData.members.some(
								(s) => f !== s && f.tag === s.tag,
							),
						);
						if (memberss.length > 0) {
							for (let member of memberss) {
								this.emit(
									'clubMemberUpdate',
									member,
									oldData,
									newData,
								);
							}
						}
					}
				}
			} else if (newData.res.status === 404) {
				let err = new Error(
					'[ Brawl Stars API Error ] - 404 Club Not Found',
				);
				this.emit('error', err, this);
			} else if (newData.res.status === 503) {
				let err = new Error(
					'[ Brawl Stars API Error ] - 503 Service Unavailable',
				);
				await this._sleep(1000 * 60 * 15); //15 minutes, or this will constantly keep spamming
				this.emit('error', err, this);
			} else if (newData.res.status === 429) {
				let err = new Error(
					'[ Brawl Stars API Error ] - 429 Too Many Requests',
				);
				this.emit('error', err, this);
				await this._sleep(5000); //5 seconds, getting this isn't good
			} else {
				let err = new Error(
					`[ Brawl Stars API Error ] - ${newData.res.status} ${
						require('http').STATUS_CODES[`${newData.res.status}`]
					}`,
				);
				this.emit('error', err, this);
			}
		} else {
			oldData = await this._fetch.json;
		}

		await this._sleep(1000 / this.ratelimit);
		return this._main();
	}

	/**
	 * Initialze the tracker
	 *
	 */
	async init() {
		await this._main();
		this.emit('ready', this);
	}
}

module.exports = Tracker;

/**
 * Tracker Options
 * @typedef {Object} TrackerOptions
 * @property {String} token - The Brawl Stars API Token
 * @property {Boolean} [useProxy=false] - Wether or not to use RoyaleAPI Proxy
 * @property {Number} [ratelimit=1] - How many times per second to check for events.
 */

/**
 * Emitted when the Tracker is ready
 * @event Tracker#ready
 * @param {Tracker} tracker
 */

/**
 * Emitted when the Tracker errors out
 * @event Tracker#error
 * @param {Error} error
 * @param {Tracker} tracker
 */

/**
 * Emitted when a change is seen in the club's name
 * @event Tracker#clubNameUpdate
 * @param {Object} oldData Old Club data
 * @param {Object} newData New Club data
 * @param {Tracker} tracker
 */

/**
 * Emitted when a change is seen in the club's description
 * @event Tracker#clubDescriptionUpdate
 * @param {Object} oldData Old Club data
 * @param {Object} newData New Club data
 * @param {Tracker} tracker The tracker
 */

/**
 * Emitted when a change is seen in the club's type
 * @event Tracker#clubTypeUpdate
 * @param {Object} oldData Old Club data
 * @param {Object} newData New Club data
 * @param {Tracker} tracker The tracker
 */

/**
 * Emitted when a change is seen in the club's badge
 * @event Tracker#clubBadgeUpdate
 * @param {Object} oldData Old Club data
 * @param {Object} newData New Club data
 * @param {Tracker} tracker The tracker
 */

/**
 * Emitted when a change is seen in the club's required trophies
 * @event Tracker#clubRequiredTrophiesUpdate
 * @param {Object} oldData Old Club data
 * @param {Object} newData New Club data
 * @param {Tracker} tracker The tracker
 */

/**
 * Emitted when a club member joins
 * @event Tracker#clubMemberAdd
 * @param {Object} member The Club member that joined
 * @param {Object} oldData Old Club data
 * @param {Object} newData New Club data
 * @param {Tracker} tracker The tracker
 */

/**
 * Emitted when a club member leaves
 * @event Tracker#clubMemberRemove
 * @param {Object} member The Club member that left
 * @param {Object} oldData Old Club data
 * @param {Object} newData New Club data
 * @param {Tracker} tracker The tracker
 */

/**
 * Emitted when a club member leaves
 * @event Tracker#clubMemberUpdate
 * @param {Object} member The Club member on whom some change was detected
 * @param {Object} oldData Old Club data
 * @param {Object} newData New Club data
 * @param {Tracker} tracker The tracker
 */
