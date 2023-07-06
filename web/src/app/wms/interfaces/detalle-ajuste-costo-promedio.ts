export interface DetalleAjusteCostoPromedio {
    detalle_ajuste_costo_promedio: number;
    ajuste_costo_promedio: number;
    articulo: number;
    presentacion: number;
    costo_promedio_sistema?: number;
    costo_promedio_correcto?: number;
}

export interface DetalleAjusteCostoPromedioResponse extends DetalleAjusteCostoPromedio {
    categoria: string;
    subcategoria: string;
    descripcion_articulo: string;
    descripcion_presentacion: string;
    confirmado: number;
    confirmado_fecha?: string;
}
