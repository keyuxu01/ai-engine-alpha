// 从 schemas 包导入类型（保持前后端类型一致）
import type { Flight } from '@repo/schemas';

// FlightData 作为 Flight 的别名，保持向后兼容
export type { Flight as FlightData } from '@repo/schemas';

interface McpFlightResult {
  flights?: Flight[];
  totalCount?: number;
  success?: boolean;
  message?: string;
}

// UserData 类型定义
export interface UserData {
  id: string;
  name: string;
  age: number;
  role: string;
  detailInfo?: {
    address: string;
    phone: string;
    email: string;
  };
}

type LowPriceFlightSearchResult = McpFlightResult;
type LowPriceFlightSearchSegmentsResult = McpFlightResult;
type McpStructuredContent = {
  flight?: McpFlightResult | Flight | null;
  error?: string;
};

export type {
  LowPriceFlightSearchResult,
  LowPriceFlightSearchSegmentsResult,
  McpStructuredContent,
  Flight,
};
