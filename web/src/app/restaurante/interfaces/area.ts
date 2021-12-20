import { Mesa } from './mesa';

export interface Area {
    area: number;
    sede: number;
    area_padre?: number;
    nombre: string;
    mesas?: Mesa[];
    impresora?: number;
    impresora_factura?: number;
    escallcenter?: number;
}
