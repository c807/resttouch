import { Reserva } from './reserva';
import { Factura } from '@pos-interfaces/factura';
import { Usuario } from '@admin-models/usuario';
import { FormaPago } from '@admin-interfaces/forma-pago';

export interface Abono {
    abono: number;
    reserva?: (number | Reserva);
    factura?: (number | Factura);
    fecha: string;
    fhcrecion?: string;
    usuario: (number | Usuario);
    fhactualizacion?: string;
    actualizadopor?: (number | Usuario);
    anulado: number;
    fecha_anulacion?: string;
    anuladopor?: (number | Usuario);
    monto?: number;
}

export interface AbonoFormaPago {
    abono_forma_pago: number;
    abono: (number | Abono);
    forma_pago: (number | FormaPago);
    monto: number;
    documento?: string;
    observaciones?: string;
    propina?: number;
    comision_monto?: number;
    retencion_monto?: number;
    vuelto_para?: number;
    vuelto?: number;
    tarjeta_respuesta?: string;
}

export interface IDataAbono {
    reserva?: number;
    factura?: number;
    serie_factura?: string;
    numero_factura?: string;
}


