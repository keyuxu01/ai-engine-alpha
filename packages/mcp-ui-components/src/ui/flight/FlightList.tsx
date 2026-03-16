import { useState, useEffect } from 'react';
import { Plane } from 'lucide-react';
import type { FlightData } from '@/types';
import { Card, CardContent } from '@ui/card';
import { Badge } from '@ui/badge';

interface FlightListProps {
  initialData?: { flights?: FlightData[] };
}

function FlightList({ initialData }: FlightListProps) {
  const [flights, setFlights] = useState<FlightData[]>(initialData?.flights || []);

  return (
    <div className="p-4 min-h-[200px] bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <Plane className="w-5 h-5" />
        <h2 className="text-lg font-semibold">航班列表</h2>
        <Badge variant="secondary">{flights.length}</Badge>
      </div>

      {flights.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>暂无航班数据</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {flights.map((flight) => (
            <Card key={flight.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {flight.flightNumber}
                  </div>
                  <div className="font-medium">
                    <span>{flight.departure}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span>{flight.arrival}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {flight.departureTime} - {flight.arrivalTime}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    ¥{flight.price}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default FlightList;
