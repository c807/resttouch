import { ComandaOrigen } from '../interfaces/comanda-origen';

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
    montocc?: number;
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