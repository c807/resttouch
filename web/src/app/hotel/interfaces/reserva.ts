import { Mesa, MesaDisponible } from '../../restaurante/interfaces/mesa';
import { TarifaReserva } from './tarifa-reserva';
import { ClienteMaster } from '../../callcenter/interfaces/cliente-master';

export interface Reserva {
    reserva: number;
    mesa: (number | Mesa | MesaDisponible);
    tarifa_reserva: (number | TarifaReserva);
    cliente_master: (number | ClienteMaster);
    estatus_reserva: number;
    fecha_del: string;
    hora_inicio?: string;
    fecha_al: string;
    hora_fin?: string;
    cantidad_adultos: number;
    cantidad_menores: number;
    descripcion_estatus_reserva?: string;
    color?: string;
    detalle?: DetalleReserva[];
    area?: number;
    numero_mesa?: number;
}

export interface DetalleReserva {
    detalle_reserva: number;
    reserva: (number | Reserva);
    fecha: string;
}
