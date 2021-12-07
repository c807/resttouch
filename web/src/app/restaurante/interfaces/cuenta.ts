import { Impresora } from '../../admin/interfaces/impresora';
import { Articulo, ArticuloImpresion } from '../../wms/interfaces/articulo';

export interface Cuenta {
    cuenta: number;
    comanda?: number;
    nombre: string;
    numero: number;
    propina_monto?: number;
    propina_porcentaje?: number;
    cerrada?: number;
    productos?: DetalleCuentaResponse[];
}

export interface DetalleCuentaResponse {
    detalle_comanda: number;
    comanda: number;
    articulo: Articulo;
    cantidad: number;
    precio: number;
    impreso: number;
    total: number;
    notas: string;
    cocinado: number;
    presentacion: number;
    numero: number;
    fecha?: string;
    tiempo_preparacion?: string;
    fecha_impresion?: string;
    fecha_proceso?: string;
    detalle_comanda_id?: number;
    bodega: number;
    descuento: number;
    detalle_cuenta: number;
    cuenta_cuenta: number;
    combo: number;
    categoria_grupo: number;
    numero_cuenta: number;
    detalle?: string[];
    monto_extra: number;
    detalle_impresion?: ArticuloImpresion[];
    impresoras_combo?: Impresora[];
}

export interface DetalleCuentaSimplified {
    comanda: number;
    detalle_comanda: number;
    articulo: number;
    descuento: number;
    detalle_cuenta: number;
    cuenta_cuenta: number;
    cantidad: number;
    impreso: number;
    precio: number;
    total: number;
    notas: string;
    combo: number;
    categoria_grupo: number;
    descripcion: string;
    multiple: number;
    esreceta: number;
    cantidad_gravable: number;
    precio_sugerido: number;
    cobro_mas_caro: number;    
    numero_cuenta: number;
    detalle_comanda_id?: number;
    impresora: number;
    sede: number;
    nombre_impresora: string;
    direccion_ip?: string;
    ubicacion?: string;
    bluetooth: number;
    bluetooth_mac_address?: string;
    modelo?: string;
    pordefecto: number;
    detalle: DetalleCuentaSimplified[];
}