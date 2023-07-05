export interface TipoMovimiento {
    tipo_movimiento: number;
    descripcion: string;
    ingreso: number;
    egreso: number;
    requisicion: number;
    esajuste_cp?: number;
}
