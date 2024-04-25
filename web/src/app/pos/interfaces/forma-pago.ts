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
