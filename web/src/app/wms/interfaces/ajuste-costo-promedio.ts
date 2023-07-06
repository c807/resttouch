export interface AjusteCostoPromedio {
    ajuste_costo_promedio: number;
    sede: number;
    descripcion_sede?: string;
    usuario: number;
    usuario_creacion?: string;    
    categoria_grupo?: number;
    subcategoria?: string;
    articulo?: number;
    descripcion_articulo?: string;
    bodega: number;
    descripcion_bodega?: string;
    fhcreacion?: string;
    fecha: string;
    notas: string;
    confirmado: number;
    confirmado_fecha?: string;
    categoria?: number;
}
