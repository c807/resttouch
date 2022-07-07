export interface Egreso {
    egreso: number;
    tipo_movimiento: number;
    bodega: number;
    fecha: string;
    creacion?: string;
    usuario: number;
    estatus_movimiento: number;
    traslado: number;
    bodega_destino?: number;
    proveedor?: number;
    tipo_movimiento_destino?: number;
    idcomandafox?: string;
    comentario?: string;
}
