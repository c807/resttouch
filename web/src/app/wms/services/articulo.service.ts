import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Categoria } from '@wms-interfaces/categoria';
import { Impresora } from '@wms-interfaces/impresora';
import { CategoriaGrupo, CategoriaGrupoResponse, CategoriaGrupoImpresora, SubCategoriaSimpleSearch } from '@wms-interfaces/categoria-grupo';
import { Articulo, ArbolArticulos, NodoProducto, ArbolCategoriaGrupo, ArticuloResponse, ArticuloCodigo, ArticuloFastEdit, ContenidoCombo } from '@wms-interfaces/articulo';
import { ArticuloDetalle } from '@wms-interfaces/articulo-detalle';
import { ArticuloTipoCliente } from '@wms-interfaces/articulo-tipo-cliente';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ArticuloService {

  private srvcErrHndl: ServiceErrorHandler;
  private articuloUrl = 'articulo';
  private categoriaUrl = 'categoria';
  private categoriaGrupoUrl = 'cgrupo';

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();

  }

  getCategorias(fltr: any = {}): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(
      `${GLOBAL.urlMantenimientos}/${this.categoriaUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getImpresoras(fltr: any = {}): Observable<Impresora[]> {
    return this.http.get<Impresora[]>(
      `${GLOBAL.urlMantenimientos}/impresora/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveCategoria(entidad: Categoria) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.categoriaUrl}/guardar${+entidad.categoria > 0 ? ('/' + entidad.categoria) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getCategoriasGrupos(fltr: any = {}): Observable<CategoriaGrupoResponse[]> {
    return this.http.get<CategoriaGrupoResponse[]>(
      `${GLOBAL.urlMantenimientos}/${this.categoriaGrupoUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getCategoriaGrupoImpresora(fltr: any = {}): Observable<CategoriaGrupoImpresora[]> {
    return this.http.get<CategoriaGrupoImpresora[]>(
      `${GLOBAL.urlMantenimientos}/${this.categoriaGrupoUrl}/get_categoria_grupo?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  adaptCategoriaGrupoResponse(lista: CategoriaGrupoResponse[]): CategoriaGrupo[] {
    const lst: CategoriaGrupo[] = [];
    lista.forEach(item => lst.push({
      categoria_grupo: +item.categoria_grupo,
      categoria: item.categoria.categoria,
      categoria_grupo_grupo:
        !!item.categoria_grupo_grupo && item.categoria_grupo_grupo.length > 0 ? +item.categoria_grupo_grupo[0].categoria_grupo : null,
      descripcion: item.descripcion,
      receta: +item.receta,
      impresora: item.impresora,
      descuento: item.descuento,
      bodega: item.bodega,
      cuenta_contable: item.cuenta_contable,
      antecesores: null,
      debaja: item.debaja,
      fechabaja: item.fechabaja,
      usuariobaja: item.usuariobaja
    }));
    return lst;
  }

  saveCategoriaGrupo(entidad: CategoriaGrupo) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.categoriaGrupoUrl}/guardar${entidad.categoria_grupo ? ('/' + entidad.categoria_grupo) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getArticulos(fltr: any = {}, simple = false): Observable<Articulo[]> {
    if (!simple) {
      return this.http.get<Articulo[]>(
        `${GLOBAL.urlCatalogos}/get_articulo?${qs.stringify(fltr)}`
      ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
    } else {
      return this.http.get<Articulo[]>(
        `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/simple_search?${qs.stringify(fltr)}`
      ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
    }
  }

  getArticuloCombo(fltr: any = {}): Observable<any[]> {
    return this.http.get<any[]>(
      `${GLOBAL.urlCatalogos}/get_articulo_combo?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getArticulosIngreso(fltr: any = {}): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(
      `${GLOBAL.urlCatalogos}/get_articulo_ingreso?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getArticulosSedeCodigo(fltr: any = {}): Observable<ArticuloCodigo[]> {
    return this.http.get<ArticuloCodigo[]>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/get_articulos_sedes_codigo?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  getArticulo(fltr: any = {}): Observable<ArticuloResponse[]> {
    return this.http.get<ArticuloResponse[]>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getArbolArticulosMante(idsede: number): Observable<ArbolArticulos[]> {
    return this.http.get<ArbolArticulos[]>(
      `${GLOBAL.urlCatalogos}/get_lista_articulo/${idsede}?_todo=true`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getArbolArticulos(idsede: number): Observable<ArbolArticulos[]> {
    return this.http.get<ArbolArticulos[]>(
      `${GLOBAL.urlCatalogos}/get_lista_articulo/${idsede}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  transformArticuloToNodo = (grps: ArbolCategoriaGrupo[]): NodoProducto[] => {
    const np: NodoProducto[] = [];

    for (let i = 0; i < grps.length; i++) {
      let grp = grps[i];

      if (!!grp.articulo && grp.articulo.length > 0) {
        np.push({
          id: grp.categoria_grupo,
          nombre: grp.descripcion,
          precio: null,
          hijos: []
        });

        for (let j = 0; j < grp.articulo.length; j++) {
          let art = grp.articulo[j];
          np[np.length - 1].hijos.push({
            id: art.articulo,
            nombre: art.descripcion,
            precio: art.precio,
            impresora: art.impresora,
            codigo: art.codigo,
            presentacion: art.presentacion,
            hijos: null
          });
        }
      }

      if (!!grp.categoria_grupo_grupo && grp.categoria_grupo_grupo.length > 0) {
        np.push({
          id: grp.categoria_grupo,
          nombre: grp.descripcion,
          precio: null,
          hijos: []
        });
        np[np.length - 1].hijos = this.transformArticuloToNodo(grp.categoria_grupo_grupo);
      }
    }

    return np;
  }

  convertToArbolNodoProducto(articulos: ArbolArticulos[]): NodoProducto[] {
    const arbol: NodoProducto[] = [];

    for (let i = 0; i < articulos.length; i++) {
      const articulo = articulos[i];
      arbol.push({
        id: articulo.categoria,
        nombre: articulo.descripcion,
        precio: null,
        hijos: this.transformArticuloToNodo(articulo.categoria_grupo)
      });
    }

    return arbol;
  }

  saveArticulo(entidad: Articulo) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/guardar${entidad.articulo ? ('/' + entidad.articulo) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  tieneMovimientos(idarticulo: number) {
    return this.http.get<any>(`${GLOBAL.urlMantenimientos}/${this.articuloUrl}/tiene_movimientos/${idarticulo}`).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
  
  fastEdit(entidad: ArticuloFastEdit): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/articulo_fast_edit`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  getArticuloDetalle(idarticulo: number, fltr: any = {}): Observable<ArticuloDetalle[]> {
    return this.http.get<ArticuloDetalle[]>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/buscar_receta/${idarticulo}?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveArticuloDetalle(entidad: ArticuloDetalle) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/guardar_receta/${entidad.receta}${entidad.articulo_detalle ? ('/' + entidad.articulo_detalle) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  replicaArticulosEnSedes(entidad: any) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/copiar`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getArticulosDePOS(): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/articulos_de_pos`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  darDeBajaArticulo(idArticulo: number): Observable<any> {    
    return this.http.get<any>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/dar_de_baja/${idArticulo}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  darDeBajaSubCategoria(idSubcat: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlMantenimientos}/${this.categoriaGrupoUrl}/dar_de_baja/${idSubcat}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  darDeBajaCategoria(idCat: number): Observable<any> {    
    return this.http.get<any>(
      `${GLOBAL.urlMantenimientos}/${this.categoriaUrl}/dar_de_baja/${idCat}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  // Inicia métodos para precios por tipo de cliente
  getArticulosPorTipoCliente(fltr: any = {}): (Observable<(ArticuloTipoCliente[] | ArticuloTipoCliente)>) {
    return this.http.get<(ArticuloTipoCliente[] | ArticuloTipoCliente)>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/get_lista_precios?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }  

  saveArticuloTipocliente(entidad: ArticuloTipoCliente) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/guardar_articulo_tipo_cliente${entidad.articulo_tipo_cliente ? ('/' + entidad.articulo_tipo_cliente) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
  // Fin de métodos para precios por tipo de cliente

  getCategoriasGruposSimple(fltr: any = {}): Observable<SubCategoriaSimpleSearch[]> {
    return this.http.get<SubCategoriaSimpleSearch[]>(
      `${GLOBAL.urlMantenimientos}/${this.categoriaGrupoUrl}/simple_search?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getContenidoCombo(idCombo: number): Observable<ContenidoCombo[]> {
    return this.http.get<ContenidoCombo[]>(
      `${GLOBAL.urlCatalogos}/get_contenido_combo/${idCombo}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getCostoArticulo(fltr: any = {}): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/get_costo?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  recalcularCostos(idSede: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlMantenimientos}/${this.articuloUrl}/recalcular_costos/${idSede}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
