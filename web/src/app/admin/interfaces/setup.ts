export interface Esquemas {
    CATALOG_NAME: string;
    SCHEMA_NAME: string;
    DEFAULT_CHARACTER_SET_NAME: string;
    DEFAULT_COLLATION_NAME: string;
    SQL_PATH: string;
}

export interface InitialSetup {
    esquema: string;
    dominio: string;
    nombre_cliente: string;
    corporacion: string;
    empresa: string;
    sede: string;
    nombres: string;
    apellidos: string;
    usuario: string;
}
