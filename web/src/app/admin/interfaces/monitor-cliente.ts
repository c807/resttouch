export interface UltimaComanda {
    corporacion: number;
    nombre_corporacion: string;
    empresa: number;
    nombre_empresa: string;
    sede: number;
    nombre_sede: string;
    comanda: number;
    fhcrecion: string;
    cantidad_comandas: number;
    ordernar_por: string;
}

export interface UltimaFactura {
    corporacion: number;
    nombre_corporacion: string;
    empresa: number;
    nombre_empresa: string;
    sede: number;
    nombre_sede: string;
    factura: string;
    fecha_factura: string;
    estatus: string;
    cantidad_facturas: number;
    ordenar_por: string;        
}
