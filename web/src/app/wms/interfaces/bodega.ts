import { Sede } from '@admin-interfaces/sede';

export interface Bodega {
  bodega: number;
  sede: number;
  descripcion: string;
  merma?: number;
  pordefecto?: number;
  permitir_requisicion?: number;
  debaja?: number;
  fechabaja?: string;
  usuariodebaja?: number;
  datos_sede?: Sede;
  order_by?: string;
  usrnamebaja?: string;
}
