export interface DetalleComanda {
    detalle_cuenta?: number;
    detalle_comanda?: number;
    articulo: number;
    cantidad: number;
    precio: number;
    total: number;
    notas: string;
    autorizado?: boolean;
    gerente?: number;
    regresa_inventario?: boolean;
}
