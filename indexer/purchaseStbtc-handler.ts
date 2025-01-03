// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { SuiEvent } from '@mysten/sui/client';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { CONFIG } from '../config';

type PurchaseEvent = {
	after_sqrt_price: string;
	amount_in: string;
	amount_out: string;
	atob: boolean;
	before_sqrt_price: string;
	fee_amount: string;
	partner: string;
	pool: string;
	ref_amount: string;
	steps: string;
	vault_a_amount: string;
	vault_b_amount: string;
};

export const handlePurchaseEvent = async (events: SuiEvent[], type: string) => {
	const updates: Prisma.PurchaseStBTCCreateInput[] = [];

	for (const event of events) {
		if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
		const data = event.parsedJson as PurchaseEvent;
		
		let bInsert = false;
		if(data.pool == CONFIG.STBTC_WBTC_POOL_ADDRESS || 
			data.pool == CONFIG.STBTC_USDC_POOL_ADDRESS || 
			data.pool == CONFIG.SUI_STBTC_POOL_ADDRESS){
				console.log(`handlePurchaseEvent: data.pool: ${data.pool}, data.atob: ${data.atob}`);
		}
		if (data.pool == CONFIG.STBTC_WBTC_POOL_ADDRESS && !data.atob) {
			bInsert = true;
		} else if (data.pool == CONFIG.STBTC_USDC_POOL_ADDRESS && data.atob) {
			bInsert = true;
		} else if (data.pool == CONFIG.SUI_STBTC_POOL_ADDRESS && !data.atob) {
			bInsert = true;
		}

		// Handle creation event
		const block_time = parseInt(event.timestampMs!);
		const date = new Date(parseInt(event.timestampMs!));
		console.log(`handleAddLiquidityEvent: data.pool: {}  date: {}`, data.pool, date);
		if (!bInsert || block_time < 1733310000000 || block_time > 1734537600000) {
			continue;
		}
		console.log('======Handling purchase event======');
		updates.push({
			buyer: event.sender,
			amount_in: data.amount_in,
			amount_out: data.amount_out,
			atob: data.atob,
			pool: data.pool,
			vault_a_amount: data.vault_a_amount,
			vault_b_amount: data.vault_b_amount,
			block_time: new Date(parseInt(event.timestampMs!)),
		});
	}

	//  As part of the demo and to avoid having external dependencies, we use SQLite as our database.
	// 	Prisma + SQLite does not support bulk insertion & conflict handling, so we have to insert these 1 by 1
	// 	(resulting in multiple round-trips to the database).
	//  Always use a single `bulkInsert` query with proper `onConflict` handling in production databases (e.g Postgres)
	if (updates.length > 0) {
		console.log('updates: ', updates);
		const promises = Object.values(updates).map((update) =>
			prisma.purchaseStBTC.create({ data: update }),
		);
		await Promise.all(promises);
	}
};