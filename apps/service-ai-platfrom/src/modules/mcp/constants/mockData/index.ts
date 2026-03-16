import type { Flight } from '@repo/schemas';
import type { User } from '@repo/schemas';
// Mock data - in production, inject from database/service
const mockFlights: Flight[] = [
  {
    id: '1',
    flightNumber: 'CA1234',
    departure: '北京',
    arrival: '上海',
    departureTime: '2026-03-15 10:00',
    arrivalTime: '2026-03-15 12:00',
    price: 1000,
    detailInfo: {
      baggage: '1 checked bag',
      cabinClass: 'Economy',
      aircraft: 'Boeing 737-800',
      duration: '2h',
      stops: 0,
      nextDay: false,
    },
  },
  {
    id: '2',
    flightNumber: 'CA1235',
    departure: '北京',
    arrival: '上海',
    departureTime: '2026-03-15 14:00',
    arrivalTime: '2026-03-15 16:00',
    price: 1200,
    detailInfo: {
      baggage: '1 checked bag',
      cabinClass: 'Business',
      aircraft: 'Boeing 737-800',
      duration: '2h',
      stops: 0,
      nextDay: false,
    },
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: '张三',
    age: 30,
    role: 'admin',
    email: 'zhangsan@example.com',
    createdAt: new Date().toISOString(),
    detailInfo: {
      address: '北京市朝阳区',
      phone: '13800138000',
      email: 'zhangsan@example.com',
    },
  },
  {
    id: '2',
    name: '李四',
    age: 25,
    role: 'user',
    email: 'lisi@example.com',
    createdAt: new Date().toISOString(),
    detailInfo: {
      address: '上海市浦东新区',
      phone: '13900139000',
      email: 'lisi@example.com',
    },
  },
];

export { mockFlights, mockUsers };
