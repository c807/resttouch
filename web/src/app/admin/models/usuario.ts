export class usrLogin {
    constructor(
        public usuario: string,
        public contrasenia: string
    ) { }
}

export class usrLogInResponse {
    constructor(
        public mensaje: string,
        public token: string,
        public usrname: string,
        public nombres: string,
        public apellidos: string,
        public sede: number,
        public idusr: number,
        public sede_uuid: string,
        public acceso: any,
        public empresa: any,
        public restaurante: any,
        public usatecladovirtual: number,
        public dominio: string,
        public wms: any,
        public rol: number
    ) { }
}

export class Usuario {
    constructor(
        public usuario: number,
        public sede: number,
        public nombres: string,
        public apellidos: string,
        public usrname: string,
        public contrasenia: string,
        public debaja: number,
        public esmesero: number,
        public pindesbloqueo: number,
        public usatecladovirtual: number,
        public confirmar_ingreso?: number,
        public confirmar_egreso?: number,
        public rol?: number
    ) { }
}
