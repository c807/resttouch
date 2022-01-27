import Dexie, { Table } from 'dexie';

//Tables
import { ArbolArticulos } from '../wms/interfaces/articulo';
import { Area } from '../restaurante/interfaces/area';

export class RTLocalDB extends Dexie {

    public arbol_articulos: Table<ArbolArticulos, number>;
    public areas: Table<Area, number>;

    constructor() {
        super('rt_local_db');
        this.version(1).stores({
            arbol_articulos: 'categoria, descripcion, categoria_grupo.categoria_grupo, categoria_grupo.descripcion, categoria_grupo.articulo.articulo, categoria_grupo.articulo.descripcion',
            areas: 'area, nombre, mesas.mesa, mesas.numero, mesas.etiqueta, updated'
        });
    }
}

export const db = new RTLocalDB();