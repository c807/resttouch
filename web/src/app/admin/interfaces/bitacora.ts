export interface Bitacora {
    bitacora: number;
    accion: number;
    usuario: number;
    fecha: string;
    tabla: string;
    registro: number;
    comentario: string;
}

export interface BitacoraReporte {
    bitacora: number;
    usuario: string;
    accion: string;
    fecha: string;
    tabla: string;
    registro: number;
    comentario: string;
}