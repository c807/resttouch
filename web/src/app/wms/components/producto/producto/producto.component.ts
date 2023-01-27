import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL, MultiFiltro } from '@shared/global';
import { saveAs } from "file-saver";
import * as moment from 'moment';

import { FormProductoComponent } from '@wms-components/producto/form-producto/form-producto.component';
import { SubCategoriaProductoComponent } from '@wms-components/producto/sub-categoria-producto/sub-categoria-producto.component';
import { Articulo, ArticuloResponse } from '@wms-interfaces/articulo';
import { Categoria } from '@wms-interfaces/categoria';
import { CategoriaGrupo, CategoriaGrupoResponse } from '@wms-interfaces/categoria-grupo';
import { ArticuloService } from '@wms-services/articulo.service';
import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { CheckPasswordComponent, ConfigCheckPasswordModel } from '@shared-components/check-password/check-password.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { DialogWizardComponent } from '@wms-components/producto/wizards/dialog-wizard/dialog-wizard.component';

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
  public lstSubCategorias: CategoriaGrupoResponse[] = [];

  public articulo: Articulo;
  public articulos: Articulo[] = [];
  public articulosFull: Articulo[] = [];
  public paramsRep: any = {};
  public txtFiltro = '';
  public cargando = false;
  @ViewChild('frmProducto') frmProductoComponent: FormProductoComponent;
  @ViewChild('frmSubcategoria') frmSubcategoria: SubCategoriaProductoComponent;

  private endSubs = new Subscription();

  constructor(
    private articuloSrvc: ArticuloService,
    private ls: LocalstorageService,
    private pdfServicio: ReportePdfService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.articulo = {
      articulo: null, categoria_grupo: null, presentacion: null, descripcion: null, precio: null, bien_servicio: 'B',
      produccion: 0, presentacion_reporte: null, mostrar_pos: 0, impuesto_especial: null, rendimiento: 1, mostrar_inventario: 0, debaja: 0, usuariobaja: null, fechabaja: null,
      cobro_mas_caro: 0, esextra: 0, stock_minimo: null, stock_maximo: null
    };
  }
  ngOnInit() {
    this.loadCategorias();
    this.loadArticulos();
    this.getSubCategorias();
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
            debaja: obj.debaja,
            cantidad_gravable: obj.cantidad_gravable,
            precio_sugerido: obj.precio_sugerido,
            cobro_mas_caro: obj.cobro_mas_caro,
            esextra: obj.esextra,
            stock_minimo: obj.stock_minimo,
            stock_maximo: obj.stock_maximo,
            bien_servicio: obj.bien_servicio
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
          this.frmProductoComponent.loadPreciosPorTipoDeCliente(this.articulo);
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
      fltr.categoria_grupo_grupo = idsubcat;
    } else {
      delete fltr.categoria_grupo_grupo;
    }

    this.endSubs.add(
      this.articuloSrvc.getCategoriasGrupos(fltr).subscribe((res: any[]) => {
        if (res && res.length > 0) {
          if (!idsubcat) {
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

  loadArticulos = (idsubcat: number = null, filtro: any = null, valor: any = null) => {

    const fltr: any = { categoria_grupo: null, _activos: true, sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0) };

    if (idsubcat) {
      fltr.categoria_grupo = idsubcat;
    } else {
      delete fltr.categoria_grupo;
    }

    if (filtro && valor) {
      fltr[filtro] = valor;
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

  verTodos = (filtro: any = null, valor: any = null) => {
    this.categoria = null;
    this.categoriaGrupo = null;
    this.frmProductoComponent.resetArticulo();
    this.frmProductoComponent.articulo.categoria_grupo = null;
    this.categoriasGrupos = [];
    this.listasCategoriasGrupo = [];
    this.loadArticulos(null, filtro, valor);
  }

  selectCategoria = (cat: Categoria) => {
    this.categoria = cat;
    this.categoriaGrupo = null;
    // this.frmProductoComponent.resetArticulo();
    this.articulos = [];
    this.loadSubCategorias(cat.categoria);
  }

  selectSubcat = (subcat: CategoriaGrupo) => {
    this.categoriaGrupo = subcat;
    this.loadSubCategorias(this.categoria.categoria, subcat.categoria_grupo);
  }

  generarRepArticulo(ucompra = 0) {
    this.paramsRep._ucompra = ucompra

    this.endSubs.add(
      this.pdfServicio.generar_catalogo_articulo(this.paramsRep).subscribe(res => {
        if (res) {
          const blob = new Blob([res], { type: "application/vnd.ms-excel" });
          saveAs(blob, `Catalogo_articulo_${moment().format(GLOBAL.dateTimeFormatRptName)}.xls`);
        }
      })
    );
  }

  generarRepReceta(conIva: number = 0) {
    this.paramsRep._coniva = conIva;
    this.endSubs.add(
      this.pdfServicio.generar_receta_costo(this.paramsRep).subscribe(res => {
        if (res) {
          const blob = new Blob([res], { type: "application/pdf" });
          saveAs(blob, `Recetas_${moment().format(GLOBAL.dateTimeFormatRptName)}.pdf`);
        }
      })
    );
  }

  getSubCategorias = () => {
    this.endSubs.add(
      this.articuloSrvc.getCategoriasGrupos({ _activos: true, _sede: this.ls.get(GLOBAL.usrTokenVar).sede }).subscribe(res => {
        this.lstSubCategorias = res.map(r => {
          r.categoria_grupo = +r.categoria_grupo;
          return r;
        });
      })
    );
  }

  recalcularCostos = () => {    
    const dialogChkPass = this.dialog.open(CheckPasswordComponent, {
      width: '40%',
      disableClose: true,
      data: new ConfigCheckPasswordModel(1)
    });

    this.endSubs.add(
      dialogChkPass.afterClosed().subscribe(res => {
        if (res) {
          const confirmRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '400px',
            data: new ConfirmDialogModel(
              'Artículos',
              'Esto hará un recálculo de los costos de todos los artículos en todas las bodegas. Es un proceso que puede tardar. ¿Desea continuar?',
              'Sí', 'No', {}, true
            )
          });

          this.endSubs.add(
            confirmRef.afterClosed().subscribe((conf: any) => {
              if (conf.resultado) {
                this.cargando = true;
                this.endSubs.add(
                  this.articuloSrvc.recalcularCostos(+this.ls.get(GLOBAL.usrTokenVar).sede || 0).subscribe(res => {
                    this.snackBar.open(res.mensaje, 'Artículo', { duration: 7000 });                    
                    this.cargando = false;
                  })
                );
              }              
            })
          );

        } else {
          this.snackBar.open('La contraseña no es correcta.', 'Anular comanda', { duration: 7000 });          
        }
      })
    );
  }

  openDialogWizard = (wiz: number) => {
    this.dialog.open(DialogWizardComponent, {
      maxWidth: '100vw', maxHeight: '85vh', width: '97vw', height: '85vh',
      disableClose: true,
      data: { wizard: +wiz }
    });    
  }
}
