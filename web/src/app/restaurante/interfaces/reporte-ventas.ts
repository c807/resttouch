import { Articulo } from '@wms-interfaces/articulo';

export interface PorCategoria {
    categoria: number;
    sede: number;
    descripcion: string;
    subcategoria: RptSubCategoria[];
}

export interface RptSubCategoria {
    descripcion: string;
    total: number;
    articulos: RptArticulo[];
}

export interface RptArticulo {
    descripcion: string;
    cantidad: number;
    porcentaje: number;
    precio_unitario: number;
    total: number;
}

export interface PorArticulo {
    datos: [
        {
            articulo: Articulo;
            cantidad: number;
            total: number;
        }
    ];
    grupo: number;
}
