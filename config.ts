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
	NETWORK: 'mainnet',
	CETUS_EVENT_TYPE: '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb',
	STBTC_WBTC_POOL_ADDRESS: '0x2d79ad383127b41352030895b5c5e5228b54b2e26c9caddb71d04b928c6a4b33',
	STBTC_USDC_POOL_ADDRESS: '0xa3184e984c2668ffa60b232485b69523a2c36baf5ef82f8534e8fcac88d71360',
    SUI_STBTC_POOL_ADDRESS: '0x333dd0d3f12c38ebd4b292c666b79329af9aadc01c535a1941a1859ff397d4c9',
	NAVI_EVENT_TYPE: '0xd899cf7d2b5db716bd2cf55599fb0d5ee38a3061e7b6bb6eebf73fa5bc4c81ca',
	STBTC_RESERVE_ID: 14,   //14 is the reserve id for STBTC
	BORROW_RESERVE_ID: 8,  //8 is the reserve id for WBTC
	STBTC_SUPPLY_THRESHOLD: 100, //0.000001 stBtc is the threshold for supply
};