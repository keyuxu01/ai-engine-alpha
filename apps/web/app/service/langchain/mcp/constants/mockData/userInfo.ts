const userInfo = [
  {
    id: '1',
    name: 'John Doe',
    age: 30,
    role: 'admin',
    detailInfo: {
      address: '123 Main St, Anytown, USA',
      phone: '123-456-7890',
      email: 'john.doe@example.com',
    },
  },
  {
    id: '2',
    name: 'Tom Doe',
    age: 25,
    role: 'user',
    detailInfo: {
      address: '123 Main St, Anytown, USA',
      phone: '123-456-7890',
      email: 'tom.white@example.com',
    },
  },
  {
    id: '3',
    name: 'Jack White',
    age: 10,
    role: 'user',
    detailInfo: {
      address: '123 Main St, Anytown, USA',
      phone: '123-456-7890',
      email: 'jack.white@example.com',
    },
  },
  {
    id: '4',
    name: 'Jill Black',
    age: 15,
    role: 'user',
    detailInfo: {
      address: '123 Main St, Anytown, USA',
      phone: '123-456-7890',
      email: 'jill.black@example.com',
    },
  },
] as const;

const userInfoResponse = {
  success: true,
  data: userInfo,
} as const;

export { userInfo, userInfoResponse };
