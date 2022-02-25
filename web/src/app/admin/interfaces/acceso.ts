export interface Acceso {
	acceso: number;
	modulo: number;
	usuario: number;
	submodulo: number;
	opcion: number;
	activo: number;
}

export interface UsuarioSede {
	usuario_sede: number,
	sede: number,
	usuario: number,
	anulado: number
}

export interface UsuarioSedeRPT {
  usuario_sede: number,
  sede: any,
  usuario: number,
  anulado: number
}
