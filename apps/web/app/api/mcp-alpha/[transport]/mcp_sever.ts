import { Flight, User } from '@repo/schemas';

import { dateBase as mockDataBase } from './constants';

// ─── Tool: search_flights ─────────────────────────────────────────────────────
const SEARCH_FLIGHTS_TOOL = 'search_flights';

const searchFlightsHandler = async ({
  departure,
  arrival,
}: {
  departure?: string;
  arrival?: string;
}) => {
  let flights: readonly Flight[] = mockDataBase.flightSearchResults as readonly Flight[];

  if (departure) {
    flights = flights.filter(f =>
      f.departure.toLowerCase().includes(departure.toLowerCase()),
    );
  }
  if (arrival) {
    flights = flights.filter(f =>
      f.arrival.toLowerCase().includes(arrival.toLowerCase()),
    );
  }

  const flightIds = flights.map(f => f.id);

  return {
    structuredContent: {
      flights: flights.slice(),
      flightIds,
      totalCount: flights.length,
    },
    content: [
      {
        type: 'text' as const,
        text:
          flights.length === 0
            ? '未找到符合条件的航班'
            : [
                `找到 ${flights.length} 个航班：`,
                ...flights
                  .slice(0, 5)
                  .map(
                    (f, i) =>
                      `${i + 1}. ${f.flightNumber} | ${f.departure} → ${f.arrival} | ${f.departureTime} - ${f.arrivalTime} | ¥${f.price}`,
                  ),
                flights.length > 5 ? `...还有 ${flights.length - 5} 个航班` : '',
              ]
                .filter(Boolean)
                .join('\n'),
      },
    ],
  };
};

// ─── Tool: get_flight_detail ──────────────────────────────────────────────────
const GET_FLIGHT_DETAIL_TOOL = 'get_flight_detail';

const getFlightDetailHandler = async ({ id }: { id: string }) => {
  const flight = mockDataBase.flightSearchResults.find(f => f.id === id);

  if (!flight) {
    return {
      isError: true,
      content: [{ type: 'text' as const, text: `未找到航班: ${id}` }],
      structuredContent: { flight: null, error: `未找到航班: ${id}` },
    };
  }

  return {
    structuredContent: { flight },
    content: [
      {
        type: 'text' as const,
        text: [
          `航班号: ${flight.flightNumber}`,
          `航线: ${flight.departure} → ${flight.arrival}`,
          `时间: ${flight.departureTime} - ${flight.arrivalTime}`,
          `价格: ¥${flight.price}`,
          flight.detailInfo
            ? [
                `机型: ${flight.detailInfo.aircraft}`,
                `舱位: ${flight.detailInfo.cabinClass}`,
                `行李: ${flight.detailInfo.baggage}`,
                `经停: ${flight.detailInfo.stops} 次`,
              ]
                .filter(Boolean)
                .join('\n')
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ],
  };
};

// ─── Tool: search_users ───────────────────────────────────────────────────────
const SEARCH_USERS_TOOL = 'search_users';

const searchUsersHandler = async ({ name, role }: { name?: string; role?: string }) => {
  let users: readonly User[] = mockDataBase.userInfo as readonly User[];

  if (name) {
    users = users.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (role) {
    users = users.filter(u => u.role.toLowerCase() === role.toLowerCase());
  }

  const userIds = users.map(u => u.id);

  return {
    structuredContent: { users: users.slice(0, 5), userIds, totalCount: users.length },
    content: [
      {
        type: 'text' as const,
        text:
          users.length === 0
            ? '未找到符合条件的用户'
            : [
                `找到 ${users.length} 个用户：`,
                ...users
                  .slice(0, 5)
                  .map((u, i) => `${i + 1}. ${u.name} | age: ${u.age} | role: ${u.role}`),
                users.length > 5 ? `...还有 ${users.length - 5} 个用户` : '',
              ]
                .filter(Boolean)
                .join('\n'),
      },
    ],
  };
};

// ─── Tool: get_user_detail ────────────────────────────────────────────────────
const GET_USER_DETAIL_TOOL = 'get_user_detail';

const getUserDetailHandler = async ({ id }: { id: string }) => {
  const user = mockDataBase.userInfo.find(u => u.id === id);

  if (!user) {
    return {
      isError: true,
      content: [{ type: 'text' as const, text: `未找到用户: ${id}` }],
      structuredContent: { user: null, error: `未找到用户: ${id}` },
    };
  }

  return {
    structuredContent: { user },
    content: [
      {
        type: 'text' as const,
        text: [
          `ID: ${user.id}`,
          `姓名: ${user.name}`,
          `年龄: ${user.age}`,
          `角色: ${user.role}`,
          `地址: ${user.detailInfo.address}`,
          `电话: ${user.detailInfo.phone}`,
          `邮箱: ${user.detailInfo.email}`,
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ],
  };
};

export {
  SEARCH_FLIGHTS_TOOL,
  GET_FLIGHT_DETAIL_TOOL,
  SEARCH_USERS_TOOL,
  GET_USER_DETAIL_TOOL,
  searchFlightsHandler,
  getFlightDetailHandler,
  searchUsersHandler,
  getUserDetailHandler,
};
