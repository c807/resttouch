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

export interface CargaRealizada_BodegaArticuloCosto {
  fecha: string;
  sede: string;
  bodega: string;
}

export interface DetalleCargaRealizada_BodegaArticuloCosto {
  fecha: string;
  sede: string;
  bodega: string;
  articulo: string;
  presentacion: string;
  cuc_ingresado: number;
  cp_ingresado: number;
  existencia_ingresada: number;
  metodo_costeo: number;
}
