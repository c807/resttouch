import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
// import { ListaProductoComponent } from '../lista-producto/lista-producto.component';
import { FormProductoComponent } from '../form-producto/form-producto.component';
import { SubCategoriaProductoComponent } from '../sub-categoria-producto/sub-categoria-producto.component';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL, MultiFiltro } from '../../../../shared/global';
import { Articulo, ArticuloResponse } from '../../../interfaces/articulo';
import { Categoria } from '../../../interfaces/categoria';
import { CategoriaGrupo } from '../../../interfaces/categoria-grupo';
import { ArticuloService } from '../../../services/articulo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit, OnDestroy {

  public categoria: Categoria;
  public categorias: Categoria[] = [];
  public categoriaGrupo: CategoriaGrupo;
  public categoriasGrupos: CategoriaGrupo[] = [];
  public listasCategoriasGrupo: any[] = [];

  public articulo: Articulo;
  public articulos: Articulo[] = [];
  public articulosFull: Articulo[] = [];
  public txtFiltro = '';
  public cargando = false;
  // @ViewChild('lstProducto') lstProductoComponent: ListaProductoComponent;
  @ViewChild('frmProducto') frmProductoComponent: FormProductoComponent;
  @ViewChild('frmSubcategoria') frmSubcategoria: SubCategoriaProductoComponent;

  private endSubs = new Subscription();

  constructor(
    private articuloSrvc: ArticuloService,
    private ls: LocalstorageService
  ) {
    this.articulo = {
      articulo: null, categoria_grupo: null, presentacion: null, descripcion: null, precio: null, bien_servicio: 'B',
      produccion: 0, presentacion_reporte: null, mostrar_pos: 0, impuesto_especial: null, rendimiento: 1, mostrar_inventario: 0, debaja: 0, usuariobaja: null, fechabaja: null
    };
  }
  ngOnInit() {
    this.loadCategorias();
    this.loadArticulos();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      this.articulos = MultiFiltro(this.articulosFull, this.txtFiltro);
    } else {
      this.articulos = JSON.parse(JSON.stringify(this.articulosFull));
    }
  }

  setArticulo = (art: Articulo) => {
    this.endSubs.add(      
      this.articuloSrvc.getArticulo({ articulo: art.articulo }).subscribe(res => {
        if (!!res && res.length > 0) {
          const obj: ArticuloResponse = res[0];
          this.articulo = {
            articulo: +obj.articulo,
            categoria_grupo: +obj.categoria_grupo.categoria_grupo,
            presentacion: obj.presentacion.presentacion,
            descripcion: obj.descripcion,
            precio: +obj.precio,
            codigo: obj.codigo,
            produccion: obj.produccion,
            presentacion_reporte: obj.presentacion_reporte.presentacion,
            mostrar_pos: obj.mostrar_pos,
            impuesto_especial: obj.impuesto_especial,
            shopify_id: obj.shopify_id,
            multiple: obj.multiple,
            cantidad_minima: obj.cantidad_minima,
            cantidad_maxima: obj.cantidad_maxima,
            combo: obj.combo,
            rendimiento: obj.rendimiento,
            mostrar_inventario: obj.mostrar_inventario,
            esreceta: obj.esreceta,
            debaja: obj.debaja
          };
  
          this.categoria = this.categorias.find(c => +c.categoria === +obj.categoria_grupo.categoria);
          this.categoriaGrupo = {
            categoria_grupo: +obj.categoria_grupo.categoria_grupo,
            categoria: +obj.categoria_grupo.categoria,
            categoria_grupo_grupo: +obj.categoria_grupo.categoria_grupo_grupo,
            descripcion: obj.categoria_grupo.descripcion,
            receta: +obj.categoria_grupo.receta,
            impresora: +obj.categoria_grupo.impresora,
            descuento: +obj.categoria_grupo.descuento
          };
          this.frmProductoComponent.articulo = this.articulo;
          this.frmProductoComponent.loadRecetas(+this.articulo.articulo);
          this.frmProductoComponent.resetReceta();
          this.frmProductoComponent.filtrarPresentaciones(this.articulo);
        }
      })
    );
  }

  setArticuloCategoriaGrupo = (idcategoriagrupo: number) => {
    this.articulo.categoria_grupo = +idcategoriagrupo;
    this.frmProductoComponent.setArticuloCategoriaGrupo(+idcategoriagrupo);
  }

  refreshArticuloList = (obj: any) => {
    this.loadArticulos();
  }

  loadCategorias = () => {
    this.endSubs.add(      
      this.articuloSrvc.getCategorias({ sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 0), _activos: true }).subscribe((res: Categoria[]) => {
        if (res) {
          this.categorias = res;
        }
      })
    );
  }

  loadSubCategorias = (idcategoria: number, idsubcat: number = null) => {

    // console.log(this.articulo);
    this.cargando = true;

    const fltr: any = {
      _activos: true,
      categoria: +idcategoria,
      categoria_grupo_grupo: null
    };

    if (idsubcat) {
      this.frmProductoComponent.articulo.categoria_grupo = idsubcat;
      fltr.categoria_grupo_grupo = idsubcat;
    } else {      
      delete fltr.categoria_grupo_grupo;      
    }

    this.endSubs.add(      
      this.articuloSrvc.getCategoriasGrupos(fltr).subscribe((res: any[]) => {
        if (res && res.length > 0) {
          if (!idsubcat) {
            this.frmProductoComponent.articulo.categoria_grupo = null;
            this.listasCategoriasGrupo = [];
          }
          this.listasCategoriasGrupo.push(this.articuloSrvc.adaptCategoriaGrupoResponse(res));
        } else {
          if (idsubcat) {
            this.loadArticulos(idsubcat);
          }
        }
        this.cargando = false;
      })
    );
  }

  loadArticulos = (idsubcat: number = null) => {

    const fltr: any = { categoria_grupo: null, _activos: true };

    if (idsubcat) {
      fltr.categoria_grupo = idsubcat;
    } else {
      delete fltr.categoria_grupo;
    }

    this.endSubs.add(      
      this.articuloSrvc.getArticulos(fltr).subscribe((res: Articulo[]) => {
        if (res) {
          this.articulosFull = res;
          this.articulos = JSON.parse(JSON.stringify(this.articulosFull));
          this.applyFilter();
        }
      })
    );
  }

  reloadCategoriasInSubcategoriasArticulos = () => {
    this.loadCategorias();
    this.frmSubcategoria.loadCategorias();
  }

  verTodos = () => {
    this.categoria = null;
    this.categoriaGrupo = null;
    this.frmProductoComponent.resetArticulo();
    this.frmProductoComponent.articulo.categoria_grupo = null;
    this.categoriasGrupos = [];
    this.listasCategoriasGrupo = [];
    this.loadArticulos();
  }

  selectCategoria = (cat: Categoria) => {
    this.categoria = cat;
    this.categoriaGrupo = null;
    // this.frmProductoComponent.resetArticulo();
    this.articulos = [];
    this.loadSubCategorias(cat.categoria)    
  }

  selectSubcat = (subcat: CategoriaGrupo) => {
    this.categoriaGrupo = subcat;
    this.loadSubCategorias(this.categoria.categoria, subcat.categoria_grupo)
  }
}
