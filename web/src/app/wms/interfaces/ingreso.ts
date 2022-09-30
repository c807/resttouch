export interface Ingreso {
    ingreso: number;
    tipo_movimiento: number;
    fecha: string;
    bodega: number;
    usuario: number;
    bodega_origen?: number;
    comentario: string;
    proveedor: number;
    estatus_movimiento?: number;
    egreso_origen?: any;
}
