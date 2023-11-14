export interface NotificacionCliente {
    notificacion_cliente: number;
    asunto: string;
    notificacion: string;
    mostrar_del: string;
    mostrar_al: string;
    prioridad: number;
    cliente_corporacion?: number;
    intensidad?: number;
}

export interface ClienteRT {
    id: number;
    cliente: string;
    dominio: string;
    bloqueado: number;
    correo?: string;
    id_recurrente?: string;
    ultimo_monto?: number;
    ultimo_checkout?: string;
    fecha_ultimo_checkout?: string;
}