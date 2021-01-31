declare module 'brawl-stars-club-tracker' {
	import EventEmitter from 'events';

	export class Tracker extends EventEmitter {
		public constructor(tag: string, options: TrackerOptions);
		public init(): Promise<void>;
		public on(event: 'ready', listener: (tracker: Tracker) => any): this;
		public on(event: 'error', listener: (error: Error, tracker: Tracker) => any): this;
		public on(event: 'clubNameUpdate', listener: (oldData: any, newData: any, tracker: Tracker) => any): this;
		public on(event: 'clubDescriptionUpdate', listener: (oldData: any, newData: any, tracker: Tracker) => any): this;
		public on(event: 'clubTypeUpdate', listener: (oldData: any, newData: any, tracker: Tracker) => any): this;
		public on(event: 'clubBadgeUpdate', listener: (oldData: any, newData: any, tracker: Tracker) => any): this;
		public on(event: 'clubRequiredTrophiesUpdate', listener: (oldData: any, newData: any, tracker: Tracker) => any): this;
		public on(event: 'clubMemberAdd', listener: (member: any, oldData: any, newData: any, tracker: Tracker) => any): this;
		public on(event: 'clubMemberRemove', listener: (member: any, oldData: any, newData: any, tracker: Tracker) => any): this;
		public on(event: 'clubMemberUpdate', listener: (member: any, oldData: any, newData: any, tracker: Tracker) => any): this;
	}

	export interface TrackerOptions {
		token: string;
        useProxy?: boolean;
        ratelimit?: number;
	}
}
