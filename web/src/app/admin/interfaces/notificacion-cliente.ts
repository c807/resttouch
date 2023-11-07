export interface NotificacionCliente {
    notificacion_cliente: number;
    asunto: string;
    notificacion: string;
    mostrar_del: string;
    mostrar_al: string;
    prioridad: number;
    cliente_corporacion?: number;
}

export interface ClienteRT {
    id: number;
    cliente: string;
    dominio: string;
    bloqueado: number;
}