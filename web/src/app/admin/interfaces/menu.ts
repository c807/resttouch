export interface Opcion {
    opcion: number;
    descripcion: string;
    incluido?: number;
}

export interface Submodulo {
    submodulo: number;
    descripcion: string;
    opciones: Opcion[];
}

export interface ModuloRol {
    modulo: number;
    descripcion: string;
    submodulos: Submodulo[];
}