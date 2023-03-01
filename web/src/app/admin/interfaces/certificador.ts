export interface Configuracion {
	certificador_configuracion: number;
	nombre: string;
	vinculo_factura: string;
	vinculo_firma: string;
	metodo_factura: string;
	vinculo_anulacion: string;
	metodo_anulacion: string;
	vinculo_grafo: string;
	metodo_grafo: string;
}

export interface Certificador {
	certificador_fel: number;
	llave: string;
	usuario: string;
	firma_llave: string;
	firma_codigo: string;
	firma_alias: string;
	nit: string;
	correo_emisor: string;
	frase_retencion_isr: number;
	frase_retencion_iva: number;
	certificador_configuracion: number;
	numero_resolucion?: string;
	fecha_resolucion?: string;
}
