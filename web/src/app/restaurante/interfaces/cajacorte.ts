import { Impresora } from "../../admin/interfaces/impresora";

export interface ccGeneral {
	caja_corte: number;
	creacion: string;
	usuario: number;
	turno: number;
	confirmado: string;
	anulado: number;
	caja_corte_tipo: ccTipo;
	serie: string;
	numero: string;
	fecha: string;
	total: number;
	descripcion_documento?: string;
	usrname?: string;
}

export interface ccDetalle {
	caja_corte_detalle: number;
	caja_corte: number;
	cantidad: number;
	total: number;
	anulado: number;
	caja_corte_nominacion: number;
	nombre: string;
}

export interface ccTipo {
	caja_corte_tipo: number;
	descripcion: string;
	unico: number;
	pedirautorizacion: number;
	pedirdocumento: number;
	conformaspago: number;
	imprimecorte: number;
}

export interface ccNominacion {
	caja_corte_nominacion: number;
	nombre: string;
	valor: number;
	calcula: number;
	orden: number;
	cantidad?: number;
	total?: number;
}

export interface ccDocumentoRetiro {
	serie: string;
	numero: string;
	fecha: string;	
	descripcion_documento?: string;
}

export interface ImpresionCorteCaja {
	Empresa: string;
	Sede: string;
	FechaDel: string;
	FechaAl: string;
	Turno?: string;
	TotalDeComensales: number;
	Impresora?: Impresora;
	Ingresos: any[];
	FacturasSinComanda: any[];
	Descuentos: any[];
	TipoVenta: any[];
}