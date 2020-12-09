import { CategoriaGrupo } from './categoria-grupo';
import { Impresora } from '../../admin/interfaces/impresora';

export interface Articulo {
    articulo: number;
    categoria_grupo: number;
    presentacion: number;
    descripcion: string;
    precio: number;
    bien_servicio?: string;
    impresora?: Impresora;
    existencias?: number;
    codigo?: string;
    combo?: number;
    multiple?: number;
    produccion?: number;
    presentacion_reporte?: number;
    mostrar_pos?: number;
    impuesto_especial?: number;
    shopify_id?: string;
    cantidad_minima?: number;
    cantidad_maxima?: number;
    rendimiento?: number;
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
}

export interface ArbolCategoriaGrupo {
    categoria_grupo: number;
    categoria: number;
    categoria_grupo_grupo: ArbolCategoriaGrupo[];
    descripcion: string;
    receta: number;
    articulo: Articulo[];
    mostrarEnPos?: boolean;
}

export interface ArbolArticulos {
    categoria: number;
    sede: number;
    descripcion: string;
    categoria_grupo: ArbolCategoriaGrupo[];
    mostrarEnPos?: boolean;
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
}
