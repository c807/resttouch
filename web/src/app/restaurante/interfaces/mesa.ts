import { Impresora } from '../../admin/interfaces/impresora';

export interface Mesa {
    mesa: number;
    area: number;
    numero: number;
    posx: number;
    posy: number;
    tamanio: number;
    estatus: number;
    ancho?: number;
    alto?: number;
    esmostrador?: number;
    vertical?: number;
    impresora?: Impresora;
    debaja?: number;
    etiqueta?: string;
    escallcenter?: number;
    esreservable?: number;
    eshabitacion?: number;
}

export interface MesaDisponible {
    mesa: number;
    area: {
        area: number;
        sede: number;
        area_padre: number;
        nombre: string;
        impresora: number;
    };
    numero: number;
    posx: number;
    posy: number;
    tamanio: number;
    estatus: number;
    ancho?: number;
    alto?: number;
    esmostrador?: number;
    vertical?: number;
    impresora?: Impresora;
    debaja?: number;
    etiqueta?: string;
    escallcenter?: number;
    esreservable?: number;
    eshabitacion?: number;
}
