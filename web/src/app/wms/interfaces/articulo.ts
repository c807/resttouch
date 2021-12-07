import { CategoriaGrupo } from './categoria-grupo';
import { Impresora } from '../../admin/interfaces/impresora';

export interface Articulo {
    articulo: number;
    categoria_grupo: number;
    presentacion: any;
    descripcion: string;
    precio: number;
    bien_servicio?: string;
    impresora?: Impresora;
    existencias?: number;
    codigo?: string;
    combo?: number;
    multiple?: number;
    produccion?: number;
    presentacion_reporte?: any;
    mostrar_pos?: number;
    impuesto_especial?: number;
    shopify_id?: string;
    cantidad_minima?: number;
    cantidad_maxima?: number;
    rendimiento?: number;
    costo?: number;
    mostrar_inventario?: number;
    esreceta?: number;
    subcategoria?: CategoriaGrupo;
    debaja?: number;
    fechabaja?: string;
    usuariobaja?: number;
    cantidad_gravable?: number;
    precio_sugerido?: number;
    cobro_mas_caro?: number;
    esextra?: number;
}

export interface ArticuloResponse {
    articulo: number;
    categoria_grupo: CategoriaGrupo;
    presentacion: any;
    descripcion: string;
    precio: number;
    codigo?: string;
    multiple?: number;
    combo?: number;
    produccion?: number;
    presentacion_reporte?: any;
    mostrar_pos?: number;
    impuesto_especial?: number;
    shopify_id?: string;
    cantidad_minima?: number;
    cantidad_maxima?: number;
    rendimiento?: number;
    mostrar_inventario?: number;
    esreceta?: number;
    debaja?: number;
    fechabaja?: string;
    usuariobaja?: number;
    cantidad_gravable?: number;
    precio_sugerido?: number;
    cobro_mas_caro?: number;
    esextra?: number;
}

export interface ArbolCategoriaGrupo {
    categoria_grupo: number;
    categoria: number;
    categoria_grupo_grupo: ArbolCategoriaGrupo[];
    descripcion: string;
    receta: number;
    articulo: Articulo[];
    mostrarEnPos?: boolean;
    debaja?: number;
    fechabaja?: string;
    usuariobaja?: number;
    cobro_mas_caro?: number;
    esextra?: number;
}

export interface ArbolArticulos {
    categoria: number;
    sede: number;
    descripcion: string;
    categoria_grupo: ArbolCategoriaGrupo[];
    mostrarEnPos?: boolean;
    debaja?: number;
    fechabaja?: string;
    usuariobaja?: number;
    cobro_mas_caro?: number;
    esextra?: number;
}

export interface NodoProducto {
    id: number;
    nombre: string;
    precio?: number;
    impresora?: Impresora;
    presentacion?: number;
    codigo?: string;
    combo?: number;
    multiple?: number;
    hijos?: NodoProducto[];
    debaja?: number;
    fechabaja?: string;
    usuariobaja?: number;
    cobro_mas_caro?: number;
    esextra?: number;
}

export interface ProductoSelected {
    id: number;
    nombre: string;
    cuenta?: number;
    idcuenta?: number;
    cantidad: number;
    impreso: number;
    precio?: number;
    total?: number;
    notas?: string;
    showInputNotas: boolean;
    itemListHeight: string;
    detalle_comanda?: number;
    detalle_cuenta?: number;
    impresora?: Impresora;
    detalle?: string[];
    monto_extra?: number;
    multiple?: number;
    combo?: number;
    esreceta?: number;
    cantidad_gravable?: number;
    precio_sugerido?: number;
    impresoras_combo?: Impresora[];
    detalle_impresion?: ArticuloImpresion[];
    cobro_mas_caro?: number;
    esextra?: number;
}

export interface ArticuloCodigo {
    codigo: string;
    descripcion: string;
}

export interface ArticuloFastEdit {
    articulo: number;
    categoria: number;
    categoria_grupo: number;
    descripcion: string;
    mostrar_pos: number;
    precio: number;
}

export interface ArticuloImpresion {
    Id: number;
    Nombre: string;
    Cantidad: number;    
    Total: number;
    Notas: string;
    Detalle: string[];
    Impresora: Impresora;
}