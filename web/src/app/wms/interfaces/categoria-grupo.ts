import { Impresora } from '../../admin/interfaces/impresora';
import { Categoria } from './categoria';
import { Articulo } from './articulo';

export interface CategoriaGrupo {
    categoria_grupo: number;
    categoria: number;
    categoria_grupo_grupo?: number;
    descripcion: string;
    receta: number;
    impresora: number;
    descuento: number;
    cuenta_contable?: string;
    bodega?: number;
    antecesores?: string;
    debaja?: number;
    fechabaja?: string;
    usuariobaja?: number;
}

export interface CategoriaGrupoResponse {
    categoria_grupo: number;
    categoria: Categoria;
    categoria_grupo_grupo: CategoriaGrupoResponse[];
    descripcion: string;
    receta: number;
    impresora: number;
    descuento: number;
    cuenta_contable?: string;
    bodega?: number;
    articulo: Articulo[];
    debaja?: number;
    fechabaja?: string;
    usuariobaja?: number;
}

export interface CategoriaGrupoImpresora {
    categoria_grupo: number;
    categoria: number;
    categoria_grupo_grupo?: number;
    descripcion: string;
    receta: number;
    impresora?: Impresora;
    cuenta_contable?: string;
    bodega?: number;
    descuento: number;
    debaja?: number;
    fechabaja?: string;
    usuariobaja?: number;
}

export interface SubCategoriaSimpleSearch {
    categoria_grupo: number;
    descripcion: string;
    categoria: string    
}
