import { flightSearchResults } from './flightSearch';
import { userInfo } from './userInfo';

const dateBase = {
  userInfo: userInfo,
  flightSearchResults: flightSearchResults,
} as const;

export { dateBase };
