export interface FlightData {
  id: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  detailInfo?: {
    baggage: string;
    cabinClass: string;
    aircraft: string;
    duration: string;
    stops: number;
    nextDay: boolean;
    comfortInfo?: {
      wifi: boolean;
      seat: string;
      meal: string;
      entertainment: string;
      noise: string;
    };
  };
}

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
