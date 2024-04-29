export interface Usuario {
	usuario: number;
	nombres: string;
	apellidos: string;
}

export interface UsuarioBodega {
	usuario_bodega: number;
	usuario: number;	
	bodega: number;
	debaja: number;
	bodega_descripcion?: string;
	bodega_debaja?: number;
}