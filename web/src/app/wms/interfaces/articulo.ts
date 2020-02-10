export interface Articulo {
    articulo: number;
    categoria_grupo: number;
    presentacion: number;
    descripcion: string;
    precio: number;
}

export interface ArbolCategoriaGrupo {
    categoria_grupo: number;
    categoria: number;
    categoria_grupo_grupo: ArbolCategoriaGrupo[];
    descripcion: string;
    receta: number;
    articulo: Articulo[];
}

export interface ArbolArticulos {
    categoria: number;
    sede: number;
    descripcion: string;
    categoria_grupo: ArbolCategoriaGrupo[];
}

export interface NodoProducto {
    id: number;
    nombre: string;
    precio?: number;
    hijos?: NodoProducto[];
}
