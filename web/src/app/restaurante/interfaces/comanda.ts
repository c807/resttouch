import { Cuenta } from './cuenta';
import { Impresora } from '@admin-interfaces/impresora';
import { Cliente } from '@admin-interfaces/cliente';
import { ClienteMaster } from '@callcenter-interfaces/cliente-master';

export interface Comanda {
    area: number;
    mesa: number;
    mesero: number;
    comensales?: number;
    esevento?: number;
    dividirCuentasPorSillas?: number;
    comanda?: number;
    cuentas: Cuenta[];
    numero_pedido?: string;
    notas_generales?: string;
    replaceUnica?: boolean;
    _no_get_comanda?: boolean;
    cliente_master?: number;
}

export interface ComandaGetResponse {
    exito?: boolean;
    comanda: number;
    usuario: number;
    sede: number;
    estatus: number;
    mesa: {
        mesa: number;
        area: {
            area: number;
            sede: number;
            area_padre?: number;
            nombre: string;
            impresora?: Impresora;
            impresora_factura?: Impresora;
        };
        numero: number;
        posx: number;
        posy: number;
        tamanio: number;
        estatus: number;
        esmostrador?: number;
        impresora?: Impresora;
        etiqueta?: string;
        escallcenter?: number;
        eshabitacion?: number;
    };
    cuentas: Cuenta[];
    turno_rol?: string[];
    mesero?: {
        usuario: number;
        nombres: string;
        apellidos: string;
    };
    mensaje?: string;
    numero_pedido?: string;
    notas_generales?: string;
    cliente_master?: number;
}

export interface IDatosTranComanda {
    mesa: ComandaGetResponse;
    clientePedido: (Cliente | ClienteMaster);
}