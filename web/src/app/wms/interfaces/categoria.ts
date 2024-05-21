export interface Categoria {
    categoria: number;
    sede: number;
    descripcion: string;
    debaja?: number;
    fechabaja?: string;
    usuariobaja?: number;
    grupos?: any[];
}
