export interface Sede {
    sede: number;
    empresa: number;
    sede_padre?: number;
    nombre: string;
    certificador_fel?: number;
    fel_establecimiento?: number;
    direccion?: string;
    telefono?: string;
    correo?: string;
    codigo?: number;
    cuenta_contable?: string;
    alias?: string;
}

export interface Corporacion {
    corporacion: number;
    admin_llave: string;
    nombre: string;
}

export interface Empresa {
    empresa: number;
    corporacion: number;
    nombre: string;
    numero_acceso: string;
    afiliacion_iva: string;
    codigo_establecimiento: string;
    correo_emisor: string;
    nit: string;
    nombre_comercial: string;
    direccion: string;
    codigo_postal: string;
    municipio: string;
    departamento: string;
    pais_iso_dos: string;
    agente_retenedor: number;
    porcentaje_iva: number;
    visa_merchant_id?: string;
    visa_transaction_key?: string;
    codigo: number;
    metodo_costeo: number;
    leyenda_isr?: string;
}
