export interface DetalleFactura {
    detalle_factura: number;
    factura: number;
    articulo: number;
    cantidad: number;
    cantidad_inventario?: number;
    precio_unitario: number;
    total: number;
    monto_base?: number;
    monto_iva?: number;
    bien_servicio?: string;
}
