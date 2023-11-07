export interface NotificacionCliente {
    notificacion_cliente: number;
    asunto: string;
    notificacion: string;
    mostrar_del: string;
    mostrar_al: string;
    prioridad: number;
    cliente_corporacion?: number;
}
