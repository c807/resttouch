import { ComandaOrigen } from './comanda-origen';

export interface FormaPago {
    forma_pago: number;
    descripcion: string;
    activo: number;    
    descuento?: number;
    aumento_porcentaje?: number;
    comision_porcentaje?: number;
    retencion_porcentaje?: number;
    pedirdocumento?: number;
    adjuntararchivo?: number;
    pedirautorizacion?: number;
    sinfactura?: number;
    esefectivo?: number;
    esabono?: number;
    montocc?: number;
    escobrohabitacion?: number;
    porcentaje_maximo_descuento?: number;
    permitir_propina?: number;
}

export interface FormaPagoComandaOrigen {
    forma_pago_comanda_origen: number;
    forma_pago?: number;
    comanda_origen: number;
    codigo: string;
}

export interface FormaPagoComandaOrigenResponse {
    forma_pago_comanda_origen: number;
    forma_pago?: FormaPago;
    comanda_origen: ComandaOrigen;
    codigo: string;        
}

export interface FormaPagoSedeCuentaContable {
    forma_pago_sede_cuenta_contable: number;
    forma_pago: number;
    sede: number;
    cuenta_contable: string;
}