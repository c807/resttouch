export interface Turno {
    turno: number;
    turno_tipo: number;
    fecha?: string;
    inicio: string;
    fin?: string;
    sede?: number;
    facturas_sin_firmar?: number;
}
