// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { SuiEvent } from '@mysten/sui/client';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { CONFIG } from '../config';

type BorrowEvent = {
	amount: string;
	reserve: number;
	sender: string;
};

export const handleBorrowEvent = async (events: SuiEvent[], type: string) => {
	const updates: Prisma.SupplyStBTCCreateInput[] = [];

	for (const event of events) {
		if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
		const data = event.parsedJson as BorrowEvent;
		
		const block_time = parseInt(event.timestampMs!);
		const date = new Date(parseInt(event.timestampMs!));
		console.log(`handleAddLiquidityEvent: data.reserve: {}  date: {}`, data.reserve, date);
		if (block_time < 1733310000000 || block_time > 1734537600000) {
			continue;
		}
		if (data.reserve != CONFIG.BORROW_RESERVE_ID){
			continue;
		}

		// Handle creation event
		console.log('======Handling borrow event======');
		updates.push({
			amount: data.amount,
			reserve: data.reserve,
			sender: data.sender,
			block_time: new Date(parseInt(event.timestampMs!)),
		});

		await prisma.naviCetusTask.upsert(
			{
				where: {
					user: data.sender,
				},
				update: {
					borrow_task: true,
				},
				create: {
					user: data.sender,
					borrow_task: true,
				}
			}
		)
	}
	if (updates.length > 0) {
		console.log('updates: ', updates);
		const promises = Object.values(updates).map((update) =>
			prisma.borrow.create({ data: update }),
		);
		await Promise.all(promises);
	}
};