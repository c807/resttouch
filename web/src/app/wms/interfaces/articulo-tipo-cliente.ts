import { ArticuloSimplified } from './articulo';
import { TipoCliente } from '../../admin/interfaces/tipo-cliente';

export interface ArticuloTipoCliente {
    articulo_tipo_cliente: number;
    articulo: (number | ArticuloSimplified);
    tipo_cliente: (number | TipoCliente);
    precio: number;
}