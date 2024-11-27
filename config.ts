import dotenv from 'dotenv';
dotenv.config();

import { Network } from './sui-utils';
/**
 * A default configuration
 * You need to call `publish-contracts.ts` before running any functionality
 * depends on it, or update our imports to not use these json files.
 * */
export const CONFIG = {
	/// Look for events every 1s
	POLLING_INTERVAL_MS: 5000,
	DEFAULT_LIMIT: 50,
	NETWORK: (process.env.NETWORK as Network) || 'mainnet',
	CETUS_EVENT_TYPE: process.env.CETUS_EVENT_TYPE || '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb',
	STBTC_POOL_ADDRESS: process.env.STBTC_POOL_ADDRESS || '0x2d79ad383127b41352030895b5c5e5228b54b2e26c9caddb71d04b928c6a4b33',
	NAVI_EVENT_TYPE: process.env.NAVI_EVENT_TYPE || '0xd899cf7d2b5db716bd2cf55599fb0d5ee38a3061e7b6bb6eebf73fa5bc4c81ca',
	STBTC_RESERVE: process.env.STBTC_RESERVE_ID || 14,   //14 is the reserve id for STBTC
	BORROW_RESERVE: process.env.BORROW_RESERVE_ID || 8,  //8 is the reserve id for WBTC
	STBTC_SUPPLY_THRESHOLD: process.env.STBTC_SUPPLY_THRESHOLD || 1000,
};