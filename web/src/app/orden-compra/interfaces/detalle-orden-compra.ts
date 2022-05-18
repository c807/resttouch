export interface DetalleOrdenCompra {
    orden_compra_detalle: number;
    orden_compra: number;
    articulo: number;
    presentacion: number;
    cantidad?: number;
    monto?: number;
    total?: number;
}
