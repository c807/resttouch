export interface TarifaReserva {
    tarifa_reserva: number;
    tipo_habitacion: number;
    cantidad_adultos: number;
    cantidad_menores: number;
    monto: number;
    monto_adicional_adulto: number;
    monto_adicional_menor: number;
    descripcion_tipo_habitacion?: string;
    icono_tipo_habitacion?: string;
}
