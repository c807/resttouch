import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL, OrdenarArrayObjetos } from '@shared/global';
import { saveAs } from 'file-saver';

import { CategoriaGrupoResponse } from '@wms-interfaces/categoria-grupo';
import { Articulo } from '@wms-interfaces/articulo';
import { ArticuloDetalle } from '@wms-interfaces/articulo-detalle';
import { ArticuloService } from '@wms-services/articulo.service';
import { Medida } from '@admin-interfaces/medida';
import { MedidaService } from '@admin-services/medida.service';
import { Presentacion } from '@admin-interfaces/presentacion';
import { PresentacionService } from '@admin-services/presentacion.service';
import { ImpuestoEspecial } from '@admin-interfaces/impuesto-especial';
import { ImpuestoEspecialService } from '@admin-services/impuesto-especial.service';
import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { ReplicarASedesDialogComponent } from '@wms-components/producto/replicar-a-sedes-dialog/replicar-a-sedes-dialog.component';
import { ListaPreciosTipoClienteComponent } from '@wms-components/producto/lista-precios-tipo-cliente/lista-precios-tipo-cliente.component';
import { DialogFormPresentacionComponent } from '@admin-components/presentacion/dialog-form-presentacion/dialog-form-presentacion.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-producto',
  templateUrl: './form-producto.component.html',
  styleUrls: ['./form-producto.component.css']
})
export class FormProductoComponent implements OnInit, OnDestroy {

  get disableEsReceta() {
    return (+this.articulo.combo === 1 || +this.articulo.multiple === 1 || +this.articulo.produccion === 1);
  }

  get articuloEsReceta() {
    return +this.articulo.esreceta === 1;
  }

  get articuloMostrarPOS() {
    return +this.articulo.mostrar_pos === 1;
  }

  get disableArticuloReceta() {
    return (artSel: Articulo) => {
      let dar = false;
      if (
        +artSel.articulo === +this.articulo.articulo ||
        (+artSel.multiple === 1 && +this.articulo.multiple === 1) ||
        (+artSel.combo === 1 && +this.articulo.combo === 1) ||
        (+artSel.combo === 1 && +this.articulo.multiple === 1) ||
        (+this.articulo.cobro_mas_caro === 1 && +artSel.multiple === 1 && (+artSel.cantidad_minima !== 2 || +artSel.cantidad_maxima !== 2)) ||
        +artSel.debaja === 1
      ) {
        dar = true;
      }
      return dar;
    }
  }

  get articuloEsOpcionMultiple() {
    return +this.articulo.multiple === 1;
  }

  get articuloEsCombo() {
    return +this.articulo.combo === 1;
  }

  get articuloMostrarInventario() {
    return +this.articulo.mostrar_inventario === 1;
  }

  get lblPrecioPorTipo(): string {
    if (!!this.articulo.articulo) {
      return `Precios de '${this.articulo.descripcion}' por tipo de cliente`;
    }
    return '';
  }

  get tabPreciosPorClienteDisabled(): boolean {
    return this.lblPrecioPorTipo.trim() === '' || this.articulo === null || this.articulo === undefined || +this.articulo.mostrar_pos === 0;
  }

  @Input() articulo: Articulo;
  @Output() articuloSvd = new EventEmitter();
  @ViewChild('lstPreciosTipoCliente') lstPreciosTipoCliente: ListaPreciosTipoClienteComponent;
  private titulo = 'Receta';
  public showArticuloForm = true;
  public medidas: Medida[] = [];
  public medidasFull: Medida[] = [];
  public presentaciones: Presentacion[] = [];
  public presentacionesFiltered: Presentacion[] = [];
  public articulos: Articulo[] = [];
  public filteredArticulos: Articulo[] = [];
  public recetas: ArticuloDetalle[] = [];
  public receta: ArticuloDetalle;
  public impuestosEspeciales: ImpuestoEspecial[] = [];
  public showDetalleForm = true;
  public displayedColumns: string[] = ['articulo', 'cantidad', 'medida', 'precio', 'editItem'];
  public dataSource: MatTableDataSource<ArticuloDetalle>;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public txtArticuloSelected: (Articulo | string) = undefined;
  public lstSubCategorias: CategoriaGrupoResponse[] = [];
  public cargando = false;  

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private articuloSrvc: ArticuloService,
    private medidaSrvc: MedidaService,
    private presentacionSrvc: PresentacionService,
    private impuestoEspecialSrvc: ImpuestoEspecialService,
    private rptSrvc: ReportePdfService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetArticulo();
    this.loadMedidas();
    this.loadArticulos();
    this.loadPresentaciones();
    this.loadImpuestosEspeciales();
    this.loadSubCategorias();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  resetArticulo = () => {
    this.articulo = {
      articulo: null,
      categoria_grupo: null,
      presentacion: null,
      descripcion: null,
      precio: null,
      bien_servicio: 'B',
      produccion: 0,
      mostrar_pos: 1,
      presentacion_reporte: null,
      impuesto_especial: null,
      shopify_id: null,
      multiple: 0,
      cantidad_minima: 1,
      cantidad_maxima: 1,
      combo: 0,
      rendimiento: 0.00,
      mostrar_inventario: 0,
      debaja: 0,
      usuariobaja: null,
      fechabaja: null,
      cobro_mas_caro: 0,
      esextra: 0,
      stock_minimo: null,
      stock_maximo: null,
      essellado: 0,
      esreceta: 0
    };
    this.recetas = [];
    this.resetReceta();
    this.presentacionesFiltered = JSON.parse(JSON.stringify(this.presentaciones));
  }

  setArticuloCategoriaGrupo = (idcatgrp: number) => this.articulo.categoria_grupo = +idcatgrp;

  onSubmit = () => {
    // console.log(this.articulo);
    this.cargando = true;
    this.endSubs.add(
      this.articuloSrvc.saveArticulo(this.articulo).subscribe(res => {
        // console.log(res);
        if (res.exito) {
          this.articuloSvd.emit();
          this.resetArticulo();
          res.articulo.categoria_grupo = +res.articulo.categoria_grupo;
          this.articulo = res.articulo;
          this.loadRecetas(this.articulo.articulo);
          this.loadArticulos();
          this.filtrarPresentaciones(this.articulo);
          this.snackBar.open('Artículo guardado con éxito...', 'Artículo', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Articulo', { duration: 3000 });
        }
        this.cargando = false;
      })
    );
  }

  loadMedidas = () => {
    this.cargando = true;
    this.endSubs.add(
      this.medidaSrvc.get().subscribe(res => {
        if (res) {
          this.medidasFull = res;
        }
        this.cargando = false;
      })
    );
  }

  loadPresentaciones = () => {
    this.cargando = true;
    this.endSubs.add(
      this.presentacionSrvc.get().subscribe(res => {
        this.presentaciones = res || [];
        this.filtrarPresentaciones();
        this.cargando = false;
      })
    );
  }

  loadSubCategorias = () => {
    this.cargando = true;
    this.endSubs.add(
      this.articuloSrvc.getCategoriasGrupos({ _activos: true, _sede: this.ls.get(GLOBAL.usrTokenVar).sede }).subscribe(res => {
        this.lstSubCategorias = res.map(r => {
          r.categoria_grupo = +r.categoria_grupo;
          return r;
        });
        this.cargando = false;
      })
    );
  }

  setNewPresentacion = (presentacionASetear: Presentacion = null) => {    
    if (presentacionASetear) {
      const existe = this.presentacionesFiltered.findIndex(p => +p.presentacion === +presentacionASetear.presentacion) > -1;
      if (existe) {
        this.articulo.presentacion = presentacionASetear.presentacion;
        this.articulo.presentacion_reporte = presentacionASetear.presentacion;
      }
    }
  }

  filtrarPresentaciones = (art: Articulo = null, presentacionASetear: Presentacion = null) => {
    if (this.presentaciones && this.presentaciones.length > 0) {
      if (art?.articulo) {
        this.cargando = true;
        this.endSubs.add(
          this.articuloSrvc.tieneMovimientos(art.articulo).subscribe(res => {
            if (res.exito) {
              if (res.tiene_movimientos) {
                const presReporte = this.presentaciones.find(p => +p.presentacion === +art.presentacion_reporte);
                this.presentacionesFiltered = this.presentaciones.filter(p => +p.medida.medida === +presReporte.medida.medida);
                this.setNewPresentacion(presentacionASetear);
              } else {
                this.presentacionesFiltered = JSON.parse(JSON.stringify(this.presentaciones));
                this.setNewPresentacion(presentacionASetear);

              }
            } else {
              this.snackBar.open(`ERROR: ${res.mensaje}`, 'Artículo', { duration: 7000 });
            }
            this.cargando = false;
          })
        );
      } else {
        this.presentacionesFiltered = JSON.parse(JSON.stringify(this.presentaciones));
        this.setNewPresentacion(presentacionASetear);
      }
    }
  }

  loadArticulos = () => {
    this.cargando = true;
    this.endSubs.add(
      this.articuloSrvc.getArticulos().subscribe(res => {
        this.articulos = res;        
        this.cargando = false;
      })
    );
  }

  loadImpuestosEspeciales = () => {
    this.cargando = true;
    this.endSubs.add(
      this.impuestoEspecialSrvc.get().subscribe(res => {
        this.impuestosEspeciales = res;        
        this.cargando = false;
      })
    );
  }

  displayArticulo = (art: Articulo) => {
    if (art) {
      this.receta.articulo = art.articulo;
      this.filtrarMedidas(art);
      return art.descripcion;
    }
    this.medidas = [];
    return undefined;
  }

  filtrarMedidas = (art: Articulo) => {
    const pres: Presentacion = this.presentaciones.find(p => +p.presentacion === +art.presentacion_reporte);
    if (pres) {
      this.medidas = this.medidasFull.filter(m => +m.medida === +pres.medida.medida);
    } else {
      this.medidas = [];
    }
  }

  filtrarArticulos = (value: (Articulo | string)) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredArticulos = this.articulos.filter(a => a.descripcion.toLowerCase().includes(filterValue));
    } else {
      this.filteredArticulos = JSON.parse(JSON.stringify(this.articulos));
    }
    // console.log(this.filteredArticulos);
  }

  resetReceta = () => {
    this.receta = {
      articulo_detalle: null,
      receta: (this.articulo.articulo || 0),
      racionable: 0,
      articulo: null,
      cantidad: 1.00,
      medida: null,
      anulado: 0,
      precio_extra: 0,
      precio: 0
    };
    this.txtArticuloSelected = undefined;
    this.updateTableDataSource();
  }

  loadRecetas = (idarticulo: number = +this.articulo.articulo) => {
    this.cargando = true;    
    this.endSubs.add(
      this.articuloSrvc.getArticuloDetalle(+idarticulo, { receta: +idarticulo }).subscribe(res => {
        this.recetas = res;
        this.updateTableDataSource();        
        this.cargando = false;
      })
    );
  }

  getReceta = (idarticulo: number = +this.articulo.articulo, iddetalle: number) => {
    this.cargando = true;
    this.endSubs.add(
      this.articuloSrvc.getArticuloDetalle(idarticulo, { articulo_detalle: iddetalle }).subscribe((res: any[]) => {
        // console.log(res);
        if (res) {
          this.receta = {
            articulo_detalle: res[0].articulo_detalle,
            receta: res[0].receta.articulo,
            racionable: res[0].articulo.articulo,
            articulo: res[0].articulo.articulo,
            cantidad: +res[0].cantidad,
            medida: res[0].medida.medida,
            anulado: res[0].anulado || 0,
            precio_extra: res[0].precio_extra || 0,
            precio: +res[0].precio
          };
          this.txtArticuloSelected = res[0].articulo;
          this.showDetalleForm = true;
        }
        this.cargando = false;
      })
    );
  }

  eliminaReceta = (item: any) => {
    // console.log('ITEM A ELIMINAR = ', item);
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Eliminar detalle',
        `¿Desea eliminar '${item.cantidad} de ${item.articulo.descripcion}' de la receta?`,
        'Sí',
        'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          item.anulado = 1;
          item.articulo = item.articulo.articulo;
          this.cargando = true;
          this.endSubs.add(
            this.articuloSrvc.saveArticuloDetalle(item).subscribe(res => {
              // console.log(res);
              this.loadRecetas();
              this.resetReceta();
              this.cargando = false;
            })
          );
        }
      })
    );
  }

  onSubmitDetail = () => {
    this.cargando = true;
    this.receta.receta = this.articulo.articulo;
    // console.log(this.articulo);
    // console.log(this.receta); return;
    this.endSubs.add(
      this.articuloSrvc.saveArticuloDetalle(this.receta).subscribe(res => {
        // console.log(res);
        if (res) {
          if (res.exito) {
            this.loadRecetas();
            this.resetReceta();
            if (res.precio && +res.precio > 0) {
              this.articulo.precio = +res.precio;
            }
          } else {
            this.snackBar.open(`ERROR: ${res.mensaje}`, 'Artículo', { duration: 3000 });
          }
        }
        this.cargando = false;
      })
    );
  }

  imprimirReceta = (conIva: number = 0) => {
    this.cargando = true;
    this.endSubs.add(
      this.rptSrvc.imprimirReceta(this.articulo.articulo, conIva).subscribe(res => {
        if (res) {
          const blob = new Blob([res], { type: 'application/pdf' });
          saveAs(blob, `${this.titulo}_${this.articulo.descripcion}.pdf`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
        }
        this.cargando = false;
      })
    );
  }

  updateTableDataSource = () => {
    this.dataSource = new MatTableDataSource(this.recetas);
    this.dataSource.filterPredicate = (data: ArticuloDetalle, filter: string) => {
      return data.articulo.descripcion.toLowerCase().includes(filter);
    };
  }

  replicarASedes = () => {
    // const replicarASedesRef = 
    this.dialog.open(ReplicarASedesDialogComponent, {
      width: '50%',
      data: { articulo: this.articulo }
    });

    // this.endSubs.add(
    //   replicarASedesRef.afterClosed().subscribe((conf: boolean) => {
    //     if (conf) {
    //     }
    //   })
    // );
  }

  applyFilter = (filter: string) => {
    this.dataSource.filter = filter.toLocaleLowerCase();
  }

  setOpcMultOff = () => {
    if (+this.articulo.combo === 1) {
      this.articulo.multiple = 0;
      this.articulo.esreceta = 0;
      this.articulo.mostrar_inventario = 0;
      this.articulo.produccion = 0;
    } else {
      this.articulo.cobro_mas_caro = 0;
    }
  }

  setComboOff = () => {
    if (+this.articulo.multiple === 1) {
      this.articulo.combo = 0;
      this.articulo.esreceta = 0;
      this.articulo.mostrar_pos = 0;
    }
  }

  apagaCombo = () => {
    if (+this.articulo.mostrar_inventario === 1) {
      this.articulo.combo = 0;
      this.articulo.multiple = 0;
      this.articulo.esreceta = 0;
    }
  }

  setOpcComboOff = () => {
    if (+this.articulo.esreceta === 1) {
      this.articulo.combo = 0;
      this.articulo.multiple = 0;
      this.articulo.mostrar_inventario = 0;
    }
  }

  setEsRecetaOn = () => {
    this.articulo.esreceta = +this.articulo.produccion;
    if (+this.articulo.produccion === 1) {
      this.setOpcComboOff();
    }
  };

  setMultipleOff = () => {
    if (+this.articulo.mostrar_pos === 1) {
      this.articulo.multiple = 0;
    }
  }

  darDeBaja = () => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        this.articulo.descripcion,
        `Esto hará que ya NO se pueda usar el artículo en ningún proceso. ¿Desea continuar?`,
        'Sí',
        'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.cargando = true;
          this.endSubs.add(
            this.articuloSrvc.darDeBajaArticulo(+this.articulo.articulo).subscribe(res => {
              if (res.exito && res.articulo) {
                res.articulo.categoria_grupo = +res.articulo.categoria_grupo;
                this.articulo = res.articulo;
              }
              this.snackBar.open(`${res.exito ? '' : 'ERROR:'} ${res.mensaje}`, 'Artículo', { duration: 5000 });
              this.cargando = false;
            })
          );
        }
      })
    );
  }

  loadPreciosPorTipoDeCliente = (art: Articulo) => {
    this.lstPreciosTipoCliente.articulo = art;
    this.lstPreciosTipoCliente.loadArticulosTipoCliente(art.articulo);
  }

  presentacionReporteChanged = (obj: MatSelectChange) => this.articulo.presentacion = obj.value;

  openNuevaPresentacion = () => {
    const dialogPresRef = this.dialog.open(DialogFormPresentacionComponent, {
      width: '75vw', height: '55vh',
      data: {}
    });

    this.endSubs.add(
      dialogPresRef.afterClosed().subscribe((res: Presentacion) => {        
        if (res && +res.presentacion > 0) {
          const um = this.medidasFull.find(m => +m.medida === +res.medida);
          res.medida = um ? um : res.medida;
          this.presentaciones.push(res);
          this.presentaciones = OrdenarArrayObjetos(this.presentaciones, 'descripcion');          
          this.filtrarPresentaciones(this.articulo, res);
        }
      })
    );

  }

}
