import { faker } from '@faker-js/faker/locale/zh_CN';
import { User } from '@repo/schemas';

function generateUser(): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.lastName() + faker.person.firstName(),
    age: faker.number.int({ min: 18, max: 70 }),
    role: faker.helpers.arrayElement(['admin', 'user'] as const),
    email: faker.internet.email(),
    createdAt: faker.date.between({ from: '2020-01-01', to: '2026-01-01' }).toISOString(),
    detailInfo: {
      address: faker.location.streetAddress(true),
      phone: faker.phone.number(),
      email: faker.internet.email(),
    },
  };
}

const userInfo: readonly User[] = Array.from({ length: 20 }, generateUser);

const userInfoResponse = {
  success: true,
  data: userInfo,
} as const;

export { userInfo, userInfoResponse };
