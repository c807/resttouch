export interface DatosGeneralesCliente {
    corporacion: number;
    nombre_corporacion: string;
    empresa: number;
    nombre_empresa: string;
    sede: number;
    nombre_sede: string;    
}

export interface UltimaComanda extends DatosGeneralesCliente {
    comanda: number;
    fhcrecion: string;
    cantidad_comandas: number;
    ordernar_por: string;
}

export interface UltimaFactura extends DatosGeneralesCliente{
    factura: string;
    fecha_factura: string;
    estatus: string;
    cantidad_facturas: number;
    ordenar_por: string;        
}

export interface Vendido extends DatosGeneralesCliente {
    venta: number;
    color: string;
}

export interface ChartStructure {
    backgroundColor: string[];
    data: number[];
    labels: string[];    
}