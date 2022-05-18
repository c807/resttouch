export interface OrdenCompra {
    orden_compra: number;
    sede: number;
    proveedor: number;
    fecha_orden: string;
    fecha?: string;
    usuario: number;
    notas?: string;
    estatus_movimiento?: number;
    tipo_movimiento?: number;
    bodega?: number;
}
