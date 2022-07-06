export interface Factura {
    factura: number;
    usuario?: number;
    factura_serie: number;
    cliente: number;
    numero_factura?: string;
    serie_factura?: string;
    fecha_factura: string;
    fel_uuid?: string;
    fel_uuid_anulacion?: string;
    moneda: number;
    certificador_fel?: number;
    exenta: number;
    notas: string;
    enviar_descripcion_unica?: number;
    descripcion_unica?: string;
}

interface ctaFactReq {
    cuenta: number;
}

export interface FacturaRequest {
    cuentas?: ctaFactReq[];
    factura_serie?: number;
    cliente?: number;
    fecha_factura?: string;
    moneda?: number;
    enviar_descripcion_unica?: number;
    descripcion_unica?: string;
    correo_receptor?: string;
}