import { Reservation, Room } from '../../models/Model';
import { HabType } from './habitacion/HabTypeE';
import { RevStat } from './reservacion/RevStat';

/**
 * Esto son datos que ses despliegan en el portal
 */
export class FakeBakend {

  /**
   * Array de Habitacinoes disponibles para filtrar en el buscador
   * en el boton del filtro de habitaciones
   */
  static RoomArrTypesFilter: Room[] = [
    {
      id: 0,
      long_status: RevStat.DISPONIBLE,
      text: 'AH1',
      type: HabType.A1,
      shouldFilter: true
    },
    {
      id: 1,
      long_status: RevStat.DISPONIBLE,
      text: 'AH2',
      type: HabType.A2,
      shouldFilter: true
    },
    {
      id: 2,
      long_status: RevStat.DISPONIBLE,
      text: 'AH3',
      type: HabType.A3,
      shouldFilter: true
    },
    {
      id: 3,
      long_status: RevStat.DISPONIBLE,
      text: 'AH4',
      type: HabType.A4,
      shouldFilter: true
    },
    {
      id: 4,
      long_status: RevStat.DISPONIBLE,
      text: 'BH1',
      type: HabType.B1,
      shouldFilter: false
    },
    {
      id: 5,
      long_status: RevStat.DISPONIBLE,
      text: 'BH2',
      type: HabType.B2,
      shouldFilter: false
    },
    {
      id: 6,
      long_status: RevStat.DISPONIBLE,
      text: 'BH3',
      type: HabType.B3,
      shouldFilter: false
    },
    {
      id: 7,
      long_status: RevStat.DISPONIBLE,
      text: 'BH4',
      type: HabType.B4,
      shouldFilter: false
    },
    {
      id: 8,
      long_status: RevStat.DISPONIBLE,
      text: 'C1',
      type: HabType.C1,
      shouldFilter: false
    },
    {
      id: 9,
      long_status: RevStat.DISPONIBLE,
      text: 'C2',
      type: HabType.C2,
      shouldFilter: false
    }, {
      id: 10,
      long_status: RevStat.DISPONIBLE,
      text: 'C3',
      type: HabType.C3,
      shouldFilter: false
    }
  ];

  /**
   * Array de tipos de habitacion
   * Lo que hace es buscar todas las reservaciones
   * Sobre las habitaciones
   *
   * Por ejemplo
   *
   * id: 0 , busca en RoomReservations todas las reservaciones
   * para esta habitacion en un rango de fecha
   */
  static RoomArr: Room[] = [
    {
      id: 0,
      long_status: RevStat.DISPONIBLE,
      text: 'RO1',
      type: HabType.A1,
      shouldFilter: false
    },
    {
      id: 1,
      long_status: RevStat.DISPONIBLE,
      text: 'RO2',
      type: HabType.A2,
      shouldFilter: false
    },
    {
      id: 2,
      long_status: RevStat.DISPONIBLE,
      text: 'RO3',
      type: HabType.A3,
      shouldFilter: false
    },
    {
      id: 3,
      long_status: RevStat.DISPONIBLE,
      text: 'RO4',
      type: HabType.A4,
      shouldFilter: false
    },
    {
      id: 4,
      long_status: RevStat.DISPONIBLE,
      text: 'RO4',
      type: HabType.B1,
      shouldFilter: false
    },
    {
      id: 5,
      long_status: RevStat.DISPONIBLE,
      text: 'RO4',
      type: HabType.B2,
      shouldFilter: false
    },
    {
      id: 6,
      long_status: RevStat.DISPONIBLE,
      text: 'AH2',
      type: HabType.B3,
      shouldFilter: false
    },
    {
      id: 7,
      long_status: RevStat.DISPONIBLE,
      text: 'RO4',
      type: HabType.B4,
      shouldFilter: false
    },
    {
      id: 8,
      long_status: RevStat.DISPONIBLE,
      text: 'C3',
      type: HabType.C1,
      shouldFilter: false
    },
    {
      id: 9,
      long_status: RevStat.DISPONIBLE,
      text: 'C1',
      type: HabType.C2,
      shouldFilter: false
    }, {
      id: 10,
      long_status: RevStat.DISPONIBLE,
      text: 'A2',
      type: HabType.C3,
      shouldFilter: false
    }
  ];

  /**
   * Array de reservaciones
   */
  static RoomReservations: Array<Reservation> = [
    {
      id: 0,
      fecha: '21/1/2022',
      room_id: 1,
      cancelado: false,
      razon: '',
      type: RevStat.MANTENIMIENTO,
    },
    {
      id: 1,
      fecha: '21/1/2022',
      room_id: 2,
      cancelado: false,
      razon: '',
      type: RevStat.RESERVADA,
    },
    {
      id: 2,
      fecha: '21/1/2022',
      room_id: 3,
      cancelado: true,
      razon: '',
      type: RevStat.RESERVADA,
    },
    {
      id: 3,
      fecha: '24/1/2022',
      room_id: 1,
      cancelado: false,
      razon: '',
      type: RevStat.RESERVADA,
    },
    {
      id: 4,
      fecha: '14/1/2022',
      room_id: 1,
      cancelado: false,
      razon: '',
      type: RevStat.RESERVADA,
    },
    {
      id: 5,
      fecha: '15/1/2022',
      room_id: 1,
      cancelado: false,
      razon: '',
      type: RevStat.RESERVADA,
    },
    {
      id: 6,
      fecha: '23/1/2022',
      room_id: 1,
      cancelado: false,
      razon: '',
      type: RevStat.MANTENIMIENTO,
    },
    {
      id: 7,
      fecha: '25/1/2022',
      room_id: 10,
      cancelado: false,
      razon: '',
      type: RevStat.MANTENIMIENTO,
    }
  ];
}
