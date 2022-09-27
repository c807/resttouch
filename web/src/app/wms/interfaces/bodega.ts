import { Sede } from '../../admin/interfaces/sede';

export interface Bodega {
  bodega: number;
  sede: number;
  descripcion: string;
  merma?: number;
  pordefecto?: number;
  permitir_requisicion?: number;
  datos_sede?: Sede;
  order_by?: string;
}
