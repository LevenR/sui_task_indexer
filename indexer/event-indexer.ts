// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { EventId, SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client';

import { CONFIG } from '../config';
import { prisma } from '../db';
import { getClient } from '../sui-utils';
import { handlePurchaseEvent } from './purchaseStbtc-handler';
import { handleSupplyStBTCEvent } from './supplyStbtc-handler';
import { handleBorrowEvent } from './borrow-handler';
import { handleAddLiquidityEvent } from './addLiquidity-handler';

type SuiEventsCursor = EventId | null | undefined;

type EventExecutionResult = {
	cursor: SuiEventsCursor;
	hasNextPage: boolean;
};

type EventTracker = {
	// The module that defines the type, with format `package::module`
	type: string;
	filter: SuiEventFilter;
	callback: (events: SuiEvent[], type: string) => any;
};

const EVENTS_TO_TRACK: EventTracker[] = [
	{
		type: `${CONFIG.CETUS_EVENT_TYPE}::pool::SwapEvent`,
		filter: {
			MoveEventType: `${CONFIG.CETUS_EVENT_TYPE}::pool::SwapEvent`
		},
		callback: handlePurchaseEvent,
	},
	{
		type: `${CONFIG.NAVI_EVENT_TYPE}::lending::DepositEvent`,
		filter: {
			MoveEventType: `${CONFIG.NAVI_EVENT_TYPE}::lending::DepositEvent`
		},
		callback: handleSupplyStBTCEvent,
	},
	{
		type: `${CONFIG.NAVI_EVENT_TYPE}::lending::BorrowEvent`,
		filter: {
			MoveEventType: `${CONFIG.NAVI_EVENT_TYPE}::lending::BorrowEvent`
		},
		callback: handleBorrowEvent,
	},
	{
		type: `${CONFIG.CETUS_EVENT_TYPE}::pool::AddLiquidityEvent`,
		filter: {
			MoveEventType: `${CONFIG.CETUS_EVENT_TYPE}::pool::AddLiquidityEvent`
		},
		callback: handleAddLiquidityEvent,
	},
];

const executeEventJob = async (
	client: SuiClient,
	tracker: EventTracker,
	cursor: SuiEventsCursor,
): Promise<EventExecutionResult> => {
	try {
		// get the events from the chain.
		// For this implementation, we are going from start to finish.
		// This will also allow filling in a database from scratch!
		const { data, hasNextPage, nextCursor } = await client.queryEvents({
			query: tracker.filter,
			cursor,
			order: 'ascending',
		});

		// handle the data transformations defined for each event
		await tracker.callback(data, tracker.type);

		// We only update the cursor if we fetched extra data (which means there was a change).
		if (nextCursor && data.length > 0) {
			await saveLatestCursor(tracker, nextCursor);

			return {
				cursor: nextCursor,
				hasNextPage,
			};
		}
	} catch (e) {
		console.error(e);
	}
	// By default, we return the same cursor as passed in.
	return {
		cursor,
		hasNextPage: false,
	};
};

const runEventJob = async (client: SuiClient, tracker: EventTracker, cursor: SuiEventsCursor) => {
	const result = await executeEventJob(client, tracker, cursor);

	// Trigger a timeout. Depending on the result, we either wait 0ms or the polling interval.
	setTimeout(
		() => {
			runEventJob(client, tracker, result.cursor);
		},
		result.hasNextPage ? 500 : CONFIG.POLLING_INTERVAL_MS,
	);
};

/**
 * Gets the latest cursor for an event tracker, either from the DB (if it's undefined)
 *  or from the running cursors.
 */
const getLatestCursor = async (tracker: EventTracker) => {
	const cursor = await prisma.cursor.findUnique({
		where: {
			id: tracker.type,
		},
	});

	console.log('Cursor: ', cursor);

	return cursor || undefined;
};

/**
 * Saves the latest cursor for an event tracker to the db, so we can resume
 * from there.
 * */
const saveLatestCursor = async (tracker: EventTracker, cursor: EventId) => {
	const data = {
		eventSeq: cursor.eventSeq,
		txDigest: cursor.txDigest,
	};

	return prisma.cursor.upsert({
		where: {
			id: tracker.type,
		},
		update: data,
		create: { id: tracker.type, ...data },
	});
};

const queryEvents = async () => { 
	const res = await prisma.purchaseStBTC.findMany();
	console.log('purchaseStBTC event: ', res);

	const res1 = await prisma.supplyStBTC.findMany();
	console.log('supplyStBTC event: ', res1);

	const res2 = await prisma.borrow.findMany();
	console.log('borrow event: ', res2);

	const res3 = await prisma.addLiquidity.findMany();
	console.log('addLiquidity event: ', res3);

	const res4 = await prisma.naviCetusTask.findMany();
	console.log('naviCetusTask: ', res4);
}

/// Sets up all the listeners for the events we want to track.
/// They are polling the RPC endpoint every second.
export const setupListeners = async () => {
	for (const event of EVENTS_TO_TRACK) {
		runEventJob(getClient(CONFIG.NETWORK), event, await getLatestCursor(event));
	}
	// saveLatestCursor(EVENTS_TO_TRACK[0], { eventSeq: "0", txDigest: "GQcSbXMBgH1nmpWfKfGwZhjU6JatL86hLgagmUcRkBww" });
	// saveLatestCursor(EVENTS_TO_TRACK[1], { eventSeq: "0", txDigest: "GQcSbXMBgH1nmpWfKfGwZhjU6JatL86hLgagmUcRkBww" });
	// saveLatestCursor(EVENTS_TO_TRACK[2], { eventSeq: "0", txDigest: "GQcSbXMBgH1nmpWfKfGwZhjU6JatL86hLgagmUcRkBww" });
	// saveLatestCursor(EVENTS_TO_TRACK[3], { eventSeq: "0", txDigest: "GQcSbXMBgH1nmpWfKfGwZhjU6JatL86hLgagmUcRkBww" });
	// await getLatestCursor(EVENTS_TO_TRACK[0])
	// await getLatestCursor(EVENTS_TO_TRACK[1])
	// await getLatestCursor(EVENTS_TO_TRACK[2])
	// await getLatestCursor(EVENTS_TO_TRACK[3])

	// await queryEvents();
};