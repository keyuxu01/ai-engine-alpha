import { faker } from '@faker-js/faker';
import { Flight } from '@repo/schemas';

const CITIES = ['北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆', '武汉', '南京'];
const AIRCRAFT_TYPES = ['Boeing 737-800', 'Boeing 777-300ER', 'Airbus A320', 'Airbus A350-900', 'COMAC C919'];
const CABIN_CLASSES = ['Economy', 'Business', 'First Class'];

function generateFlight(): Flight {
  const departureCity = faker.helpers.arrayElement(CITIES);
  const arrivalCity = faker.helpers.arrayElement(CITIES.filter(c => c !== departureCity));

  const departureDate = faker.date.between({ from: '2026-03-01', to: '2026-06-30' });
  const departureHour = faker.number.int({ min: 6, max: 22 });
  const departureMinute = faker.helpers.arrayElement([0, 15, 30, 45]);

  const departureTimeStr = `${departureDate.toISOString().slice(0, 10)} ${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`;

  const durationMinutes = faker.number.int({ min: 60, max: 300 });
  const arrivalDate = new Date(new Date(`${departureTimeStr}`).getTime() + durationMinutes * 60 * 1000);
  const arrivalTimeStr = `${arrivalDate.toISOString().slice(0, 10)} ${arrivalDate.toTimeString().slice(0, 5)}`;

  return {
    id: faker.string.uuid(),
    flightNumber: `CA${faker.number.int({ min: 1000, max: 9999 })}`,
    departure: departureCity,
    arrival: arrivalCity,
    departureTime: departureTimeStr,
    arrivalTime: arrivalTimeStr,
    price: faker.number.int({ min: 300, max: 3000 }),
    detailInfo: {
      baggage: faker.helpers.arrayElement(['1 checked bag', '2 checked bags', 'No checked bag']),
      cabinClass: faker.helpers.arrayElement(CABIN_CLASSES),
      aircraft: faker.helpers.arrayElement(AIRCRAFT_TYPES),
      duration: `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 > 0 ? ` ${durationMinutes % 60}m` : ''}`,
      stops: faker.helpers.arrayElement([0, 0, 0, 1, 1, 2]),
      nextDay: arrivalDate.getDate() !== departureDate.getDate(),
    },
  };
}

const flightSearchResults = Array.from({ length: 20 }, generateFlight);

export { flightSearchResults };
