import type { ChainID, ChainStatus } from './chains';

/*
 * Type for storing essential data for an API instance.
 */
export interface FlattenedAPIData {
  endpoint: string;
  chainId: ChainID;
  status: ChainStatus;
}
