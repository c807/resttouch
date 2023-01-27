import { Corporacion, Sede } from '@admin-interfaces/sede';
import { ComandaOrigen } from '@admin-interfaces/comanda-origen';
import { FormaPago } from '@admin-interfaces/forma-pago';
import { EstatusOrdenGk } from './estatus-orden-gk';

export interface OrdenGk {
    orden_gk: number;
    corporacion: number;
    protocolo?: string;
    host?: string;
    ip?: string;
    url_original?: string;
    comanda_origen: number;
    fhcreacion: string;
    numero_orden: string;
    estatus_orden_gk: number;
    raw_orden?: string;
    orden_rt?: string;    
}

export interface articulo_gk {
    id_tercero: string;
    descripcion: string;
    vendor: string;
    atiende: Sede;
    precio: number;
    cantidad: number;
    descuento: number;
    total: number;
}

export interface DatosEntregaGK {
    nombre: string;
    direccion1: string;
    direccion2: string;
    pais: string;
    departamento: string;
    municipio: string;
    telefono: string;
    email: string;
}

export interface DatosFacturaGK {
    nit: string;
    nombre: string;
    direccion: string;
    email: string;
}

export interface OrdenRT {
    numero_orden: string;
    total_orden: number;
    total_descuento: number;
    comanda_origen: number;
    total_propina?: number;
    completa: boolean;
    pendiente: string;
    datos_entrega: DatosEntregaGK;
    formas_pago: FormaPago[];
    datos_factura: DatosFacturaGK;
    articulos: articulo_gk[];
}

export interface OrdenGkResponse {
    orden_gk: number;
    corporacion: Corporacion;
    protocolo?: string;
    host?: string;
    ip?: string;
    url_original?: string;
    comanda_origen: ComandaOrigen;
    fhcreacion: string;
    numero_orden: string;
    estatus_orden_gk: EstatusOrdenGk;
    raw_orden?: string;
    orden_rt?: OrdenRT;
}
