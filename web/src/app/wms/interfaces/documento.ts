import { Ingreso } from './ingreso';
import { DocumentoTipo } from '@admin-interfaces/documento-tipo';
import { TipoCompraVenta } from '@admin-interfaces/tipo-compra-venta';

export interface Documento {
    documento: number;
    ingreso: (number | Ingreso);
    documento_tipo: (number | DocumentoTipo);
    serie: string;
    numero: string;
    fecha: string;
    tipo_compra_venta: (number | TipoCompraVenta);
    enviado: number;
}
