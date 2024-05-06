export interface NotaSubCategoria {
    categoria_grupo_nota_predefinida: number;
    categoria_grupo: number;
    nota_predefinida: number;
}


export interface NotaSubCategoriaReq {
    nota: number;
    grupos: any;
}