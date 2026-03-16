import { useState, useEffect, use } from 'react';
import type { FlightData } from '@/types';

interface FlightDetailProps {
  initialData?: { flight?: FlightData };
}

function FlightDetail({ initialData }: FlightDetailProps) {
  const [flight, setFlight] = useState<FlightData | undefined>(initialData?.flight);

  if (!flight) {
    return (
      <div className="p-4 min-h-[200px] bg-gray-50 dark:bg-gray-900">
        <div className="text-center py-10 text-gray-500">暂无航班详情</div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-[200px] bg-gray-50 dark:bg-gray-900">
      <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {flight.flightNumber}
        </div>
        <div className="text-lg mt-2">
          {flight.departure} → {flight.arrival}
        </div>
      </div>

      {flight.detailInfo && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">航班信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">日期</span>
              <span className="text-sm font-medium">{flight.departureTime}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">机型</span>
              <span className="text-sm font-medium">{flight.detailInfo.aircraft}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">舱位</span>
              <span className="text-sm font-medium">{flight.detailInfo.cabinClass}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">飞行时长</span>
              <span className="text-sm font-medium">{flight.detailInfo.duration}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">经停</span>
              <span className="text-sm font-medium">
                {flight.detailInfo.stops === 0
                  ? '直飞'
                  : `${flight.detailInfo.stops}次经停`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">行李</span>
              <span className="text-sm font-medium">{flight.detailInfo.baggage}</span>
            </div>
          </div>
        </div>
      )}

      {flight.detailInfo?.comfortInfo && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">舒适度</h3>
          <div className="flex flex-wrap gap-2">
            {flight.detailInfo.comfortInfo.wifi && (
              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                📶 WiFi
              </span>
            )}
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
              🪑 {flight.detailInfo.comfortInfo.seat}
            </span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
              🍱 {flight.detailInfo.comfortInfo.meal}
            </span>
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
              🎬 {flight.detailInfo.comfortInfo.entertainment}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-base font-medium">票价</span>
        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
          ¥{flight.price}
        </span>
      </div>
    </div>
  );
}

export default FlightDetail;
