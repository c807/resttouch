import { HabType } from '@hotel-components/booker/habitacion/HabTypeE';
import { RevStat } from '@hotel-components/booker/reservacion/RevStat';

export class Reservation {
  id: number;
  fecha: string;
  room_id: number;
  cancelado: boolean;
  razon: string;
  type: RevStat;
}

export class Room {
  id: number;
  long_status: string; // For all time condition
  text: string;
  type: HabType;
  shouldFilter: boolean;
}
