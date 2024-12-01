// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { SuiEvent } from '@mysten/sui/client';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { CONFIG } from '../config';

type SupplyStBTCEvent = {
	amount: string;
	reserve: number;
	sender: string;
};

export const handleSupplyStBTCEvent = async (events: SuiEvent[], type: string) => {
	const updates: Prisma.SupplyStBTCCreateInput[] = [];

	for (const event of events) {
		if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
		const data = event.parsedJson as SupplyStBTCEvent;

		if (data.reserve != CONFIG.STBTC_RESERVE_ID){
			continue;
		}

		// Handle creation event
		console.log('======Handling supply stbtc event======');
		updates.push({
			amount: data.amount,
			reserve: data.reserve,
			sender: data.sender,
			block_time: new Date(parseInt(event.timestampMs!)),
		});
		if (Number(data.amount) > Number(CONFIG.STBTC_SUPPLY_THRESHOLD)) {

			await prisma.naviCetusTask.upsert(
				{
					where: {
						user: data.sender,
					},
					update: {
						supply_task: true,
					},
					create: {
						user: data.sender,
						supply_task: true,
					}
				}
			)
		}
	}
	if (updates.length > 0) {
		console.log('updates: ', updates);
		const promises = Object.values(updates).map((update) =>
			prisma.supplyStBTC.create({ data: update }),
		);
		await Promise.all(promises);
	}
};