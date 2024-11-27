// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { SuiEvent } from '@mysten/sui/client';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { CONFIG } from '../config';

type AddLiquidityEvent = {
	after_liquidity: string;
	amount_a: string;
	amount_b: string;
	liquidity: string;
	pool: string;
	position: string;
};

export const handleAddLiquidityEvent = async (events: SuiEvent[], type: string) => {
	const updates: Prisma.AddLiquidityCreateInput[] = [];

	for (const event of events) {
		if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
		const data = event.parsedJson as AddLiquidityEvent;
		
		if (data.pool !== CONFIG.STBTC_POOL_ADDRESS){
			continue;
		}

		// Handle creation event
		console.log('======Handling add liquidity event======');
		updates.push({
			sender: event.sender,
			after_liquidity: data.after_liquidity,
			amount_a: data.amount_a,
			amount_b: data.amount_b,
			liquidity: data.liquidity,
			pool: data.pool,
			position: data.position,
			block_time: new Date(parseInt(event.timestampMs!)),
		});
		await prisma.naviCetusTask.upsert(
			{
				where: {
					user: event.sender,
				},
				update: {
					liquidity_task: true,
				},
				create: {
					user: event.sender,
					liquidity_task: true,
				}
			}
		)
	}

	//  As part of the demo and to avoid having external dependencies, we use SQLite as our database.
	// 	Prisma + SQLite does not support bulk insertion & conflict handling, so we have to insert these 1 by 1
	// 	(resulting in multiple round-trips to the database).
	//  Always use a single `bulkInsert` query with proper `onConflict` handling in production databases (e.g Postgres)
	if (updates.length > 0) {
		console.log('updates: ', updates);
		const promises = Object.values(updates).map((update) =>
			prisma.addLiquidity.create({ data: update }),
		);
		await Promise.all(promises);
	}
};