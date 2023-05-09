export interface Rol {
    rol: number;
    descripcion: string;
}

export interface RolAcceso {
    rol_acceso: number;
    rol: number | Rol;
    modulo: number;
    submodulo: number;
    opcion: number;
    incluido: number;    
}
