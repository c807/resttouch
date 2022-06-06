import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';

import { Egreso } from '../../../interfaces/egreso';
import { DetalleEgreso } from '../../../interfaces/detalle-egreso';
import { EgresoService } from '../../../services/egreso.service';
import { TipoMovimiento } from '../../../interfaces/tipo-movimiento';
import { TipoMovimientoService } from '../../../services/tipo-movimiento.service';
import { Bodega } from '../../../interfaces/bodega';
import { BodegaService } from '../../../services/bodega.service';
import { Proveedor } from '../../../interfaces/proveedor';
import { ProveedorService } from '../../../services/proveedor.service';
import { Articulo } from '../../../interfaces/articulo';
import { ArticuloService } from '../../../services/articulo.service';
import { TransformacionService } from '../../../services/transformacion.service';
import { Presentacion } from '../../../../admin/interfaces/presentacion';
import { PresentacionService } from '../../../../admin/services/presentacion.service';
import { ReportePdfService } from '../../../../restaurante/services/reporte-pdf.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { saveAs } from 'file-saver';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-egreso',
  templateUrl: './form-egreso.component.html',
  styleUrls: ['./form-egreso.component.css']
})
export class FormEgresoComponent implements OnInit, OnDestroy {

  @Input() egreso: Egreso;
  @Input() saveToDB = true;
  @Output() egresoSavedEv = new EventEmitter();

  public showEgresoForm = true;
  public showDetalleEgresoForm = true;

  public detallesEgreso: DetalleEgreso[] = [];
  public detallesEgresoPaged: DetalleEgreso[];
  public detalleEgreso: DetalleEgreso;
  public detallesMerma: DetalleEgreso[] = [];
  public detalleMerma: DetalleEgreso;
  public displayedColumns: string[] = ['articulo', 'presentacion', 'cantidad', 'precio_unitario', 'precio_total', 'editItem'];
  public displayedColumnsM: string[] = ['cantidad_utilizada', 'articulo', 'presentacion', 'cantidad', 'editItem'];
  public dataSource: MatTableDataSource<DetalleEgreso>;
  public dataSourceM: MatTableDataSource<DetalleEgreso>;
  public tiposMovimiento: TipoMovimiento[] = [];
  public tiposMovimientoIngreso: TipoMovimiento[] = [];
  public bodegas: Bodega[] = [];
  public articulos: Articulo[] = [];
  public filteredArticulos: Articulo[] = [];
  public proveedores: Proveedor[] = [];
  public filteredProveedores: Proveedor[] = [];
  public presentaciones: Presentacion[] = [];
  public fltrPresentaciones: Presentacion[] = [];
  public fltrPresentacionesMerma: Presentacion[] = [];
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public bloqueoBotones = false;
  public txtArticuloSelected: (Articulo | string) = undefined;
  public txtArticuloSelectedM: (Articulo | string) = undefined;
  public txtProveedorSelected: (Proveedor | string) = undefined;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private egresoSrvc: EgresoService,
    private tipoMovimientoSrvc: TipoMovimientoService,
    private bodegaSrvc: BodegaService,
    private articuloSrvc: ArticuloService,
    private proveedorSrvc: ProveedorService,
    private transformacionSrvc: TransformacionService,
    private presentacionSrvc: PresentacionService,
    private pdfServicio: ReportePdfService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetEgreso();
    this.loadTiposMovimiento();
    this.loadTiposMovimiento(false);
    this.loadBodegas();
    this.loadArticulos();
    this.loadProveedores();
    this.loadPresentaciones();
    if(!this.saveToDB) {
      this.displayedColumns = ['articulo', 'presentacion', 'cantidad', 'editItem'];
    }
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadTiposMovimiento = (paraEgreso = true) => {
    const fltr = paraEgreso ? { egreso: 1 } : { ingreso: 1 };
    this.tipoMovimientoSrvc.get(fltr).subscribe(res => {
      if (res) {
        if (paraEgreso) {
          this.tiposMovimiento = res;
        } else {
          this.tiposMovimientoIngreso = res;
        }
      }
    });
  }

  loadBodegas = () => {
    this.bodegaSrvc.get({ sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0) }).subscribe(res => {
      if (res) {
        this.bodegas = res;
      }
    });
  }

  loadProveedores = () => {
    this.proveedorSrvc.get().subscribe(res => {
      if (res) {
        this.proveedores = res;
      }
    });
  }

  loadPresentaciones = () => {
    this.presentacionSrvc.get().subscribe(res => {
      if (res) {
        this.presentaciones = res;
      }
    });
  }

  resetEgreso = () => {
    this.egreso = {
      egreso: null, tipo_movimiento: null, bodega: null, fecha: moment().format(GLOBAL.dbDateFormat),
      usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), estatus_movimiento: 1, traslado: 0
    };
    this.resetDetalleEgreso();
    this.updateTableDataSource();
    this.resetDetalleMerma();
    this.updateTableDataSourceM();
  }

  onSubmit = () => {
    this.bloqueoBotones = true;
    this.egresoSrvc.save(this.egreso).subscribe(res => {
      if (res.exito) {
        this.egresoSavedEv.emit();
        this.resetEgreso();
        this.egreso = {
          egreso: res.egreso.egreso,
          tipo_movimiento: res.egreso.tipo_movimiento,
          fecha: res.egreso.fecha,
          bodega: res.egreso.bodega,
          creacion: res.egreso.creacion,
          usuario: res.egreso.usuario,
          estatus_movimiento: res.egreso.estatus_movimiento,
          traslado: res.egreso.traslado
        };
        this.loadDetalleEgreso(this.egreso.egreso);
      }
      this.bloqueoBotones = false;
    });
  }

  confirmarEgreso = () => {
    this.egreso.estatus_movimiento = 2;
    this.onSubmit();
  }

  loadArticulos = () => {
    this.articuloSrvc.getArticulosIngreso().subscribe(res => {
      if (res) {
        this.articulos = res;
      }
    });
  }

  resetDetalleEgreso = () => {
    this.detalleEgreso = {
      egreso_detalle: null, egreso: (!!this.egreso.egreso ? this.egreso.egreso : null), articulo: null, cantidad: null,
      precio_unitario: null, precio_total: null, presentacion: 0
    };
    this.txtArticuloSelected = undefined;
  }

  resetDetalleMerma = () => {
      this.detalleMerma = {
        egreso_detalle: null, egreso: (!!this.egreso.egreso ? this.egreso.egreso : null), articulo: null, cantidad: null,
        precio_unitario: null, precio_total: null, presentacion: 0
      }

      this.txtArticuloSelectedM = undefined;
  }

  loadDetalleEgreso = (idegreso: number = +this.egreso.egreso) => {
    this.egresoSrvc.getDetalle(idegreso, { egreso: idegreso }).subscribe(res => {
      // console.log(res);
      if (res) {
        this.detallesEgreso = res;
        this.updateTableDataSource();
      }
    });
  }

  getDetalleEgreso = (idegreso: number = +this.egreso.egreso, iddetalle: number) => {
    this.egresoSrvc.getDetalle(idegreso, { egreso_detalle: iddetalle }).subscribe((res: any[]) => {
      // console.log(res);
      if (res) {
        this.detalleEgreso = {
          egreso_detalle: res[0].egreso_detalle,
          egreso: res[0].egreso,
          articulo: res[0].articulo.articulo,
          cantidad: +res[0].cantidad,
          precio_unitario: +res[0].precio_unitario,
          precio_total: +res[0].precio_total,
          presentacion: res[0].presentacion.presentacion
        };
        this.setPresentaciones();
        if (!this.saveToDB) {
          this.setPresentacionesMerma();
        }
        this.txtArticuloSelected = res[0].articulo;
        this.showDetalleEgresoForm = true;
      }
    });
  }

  onSubmitDetail = () => {
    this.bloqueoBotones = true;
    this.detalleEgreso.egreso = this.egreso.egreso;
    // console.log(this.detalleEgreso);
    this.egresoSrvc.saveDetalle(this.detalleEgreso).subscribe(res => {
      // console.log(res);
      if (res.exito) {
        this.loadDetalleEgreso();
        this.resetDetalleEgreso();
        this.snackBar.open('Egreso guardado con éxito...', 'Egreso', { duration: 3000 });
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Egreso', { duration: 3000 });
      }
      this.bloqueoBotones = false;
    });
  }

  addToDetail = () => {
    if (this.detalleEgreso.cantidad > 0){
      this.detallesEgreso.splice(this.detallesEgreso.findIndex(de => +de.articulo === +this.detalleEgreso.articulo), 1);
      this.detallesEgreso.push(this.detalleEgreso);
      
      this.resetDetalleEgreso();
      this.updateTableDataSource();
    } else {
      this.snackBar.open(`ERROR: La cantidad debe ser mayor a 0`, 'Egreso', { duration: 3000 });
    }
    
  }

  addToDetailMerma = () => {
    if (this.detalleMerma.cantidad > 0 && this.detalleMerma.cantidad_utilizada > 0) {
      var index = this.detallesMerma.findIndex(de => +de.articulo === +this.detalleMerma.articulo);
      if (index > -1) {
        this.detallesMerma.splice(index, 1);
      }
      var art:any;
      art = this.articulos.filter(p => +p.articulo == this.detalleMerma.articulo);
      this.detalleMerma.presentacion = art[0].presentacion_reporte;

      this.detallesMerma.push(this.detalleMerma);
      this.txtArticuloSelectedM = undefined;
      this.resetDetalleMerma();
      this.updateTableDataSourceM();
    } else if(this.detalleMerma.cantidad <= 0){
      this.snackBar.open(`ERROR: La cantidad debe ser mayor a 0`, 'Egreso', { duration: 3000 });
    } else if(this.detalleMerma.cantidad_utilizada <= 0){
      this.snackBar.open(`ERROR: La cantidad a utilizar debe ser mayor a 0`, 'Egreso', { duration: 3000 });
    }
    
  }

  editFromDetail = (idarticulo: number) => {
    var tmp = this.detallesEgreso.filter(de => +de.articulo === +idarticulo)[0];
    this.detalleEgreso = {
      egreso_detalle: tmp.egreso_detalle, egreso: tmp.egreso_detalle, articulo: tmp.articulo, cantidad: tmp.cantidad,
      precio_unitario: tmp.precio_unitario, precio_total: tmp.precio_unitario, presentacion: tmp.presentacion
    };
    this.setPresentaciones(true);
    this.txtArticuloSelected = this.articulos.filter(p => +p.articulo == this.detalleEgreso.articulo)[0];
    //this.showDetalleIngresoForm = true;
    //
  }

  editFromDetailMerma = (idarticulo: number) => {
    var tmp = this.detallesMerma.filter(de => +de.articulo === +idarticulo)[0];
    this.detalleMerma = {
      egreso_detalle: tmp.egreso_detalle, egreso: tmp.egreso_detalle, articulo: tmp.articulo, cantidad: tmp.cantidad,
      precio_unitario: tmp.precio_unitario, precio_total: tmp.precio_unitario, presentacion: tmp.presentacion, 
      cantidad_utilizada: tmp.cantidad_utilizada
    };
    this.setPresentacionesMerma();
    this.txtArticuloSelectedM = this.articulos.filter(p => +p.articulo == this.detalleMerma.articulo)[0];
    //this.showDetalleIngresoForm = true;
    //
  }

  removeFromDetailMerma = (idarticulo: number) =>
    this.detallesMerma.splice(this.detallesMerma.findIndex(de => +de.articulo === +idarticulo), 1)

  removeFromDetail = (idarticulo: number) =>
    this.detallesEgreso.splice(this.detallesEgreso.findIndex(de => +de.articulo === +idarticulo), 1)

  getDescripcionArticulo = (idarticulo: number) => this.articulos.find(art => +art.articulo === +idarticulo).descripcion || '';

  getDescripcionPresentacion = (idpresentacion: number) =>
    (this.presentaciones.find(p => +p.presentacion === +idpresentacion).descripcion || '')

  updateTableDataSource = () => {
    this.dataSource = new MatTableDataSource(this.detallesEgreso);
    this.dataSource.filterPredicate = (data: DetalleEgreso, filter: string) => {
      return data.articulo.descripcion.toLowerCase().includes(filter);
    };
  }
  updateTableDataSourceM = () => {
    this.dataSourceM = new MatTableDataSource(this.detallesMerma);
  }

  filtrarArticulos = (value: (Articulo | string)) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredArticulos =
        this.articulos.filter(a => a.descripcion.toLowerCase().includes(filterValue));
    } else {
      this.filteredArticulos = this.articulos;
    }
  }

  setPresentaciones = (update: boolean = false) => {
    this.fltrPresentaciones = [];
    const idx = this.articulos.findIndex(p => +p.articulo === +this.detalleEgreso.articulo);
    const articulo = this.articulos[idx];
    this.fltrPresentaciones = this.presentaciones.filter(p => +p.medida.medida === +articulo.presentacion.medida);
    if (!update) {
      this.detalleEgreso.presentacion = null;
    }
  }

  setPresentacionesMerma = () => {
    this.fltrPresentacionesMerma = [];
    const idx = this.articulos.findIndex(p => +p.articulo === +this.detalleMerma.articulo);
    const articulo = this.articulos[idx];
    this.fltrPresentacionesMerma = this.presentaciones.filter(p => +p.medida.medida === +articulo.presentacion.medida);
  }

  displayArticulo = (art: Articulo) => {
    if (art) {
      this.detalleEgreso.articulo = art.articulo;
      return art.descripcion;
    }
    return undefined;
  }

  displayArticuloMerma = (art: Articulo) => {
    if (art) {
      this.detalleMerma.articulo = art.articulo;
      return art.descripcion;
    }
    return undefined;
  }

  filtrarProveedores = (value: (Proveedor | string)) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredProveedores =
        this.proveedores.filter(a => a.razon_social.toLowerCase().includes(filterValue) || a.nit.toLowerCase().includes(filterValue));
    } else {
      this.filteredProveedores = this.proveedores;
    }
  }

  displayProveedor = (p: Proveedor) => {
    if (p) {
      this.egreso.proveedor = p.proveedor;
      return `(${p.nit}) ${p.razon_social}`;
    }
    return undefined;
  }

  applyFilter = (filter: string) => {
    this.dataSource.filter = filter;
  }

  imprimirEgreso = () => {    
    this.endSubs.add(
      this.pdfServicio.getEgreso(+this.egreso.egreso).subscribe(res => {
        if (res) {
          const blob = new Blob([res], { type: 'application/pdf' });
          saveAs(blob, `Salida_${this.egreso.egreso}_${moment().format(GLOBAL.dateTimeFormatRptName)}.pdf`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Egreso', { duration: 3000 });
        }        
      })
    );    
  }

  eliminarDetalle = (idDetalle: number) => {    
    const delRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Eliminar detalle', 'Esto eliminará esta línea de detalle. ¿Desea continuar?', 'Sí', 'No')
    });

    delRef.afterClosed().subscribe((confirma: boolean) => {
      if (confirma) {
        this.egresoSrvc.eliminarDetalle(idDetalle).subscribe(res => {
          if (res.exito) {
            this.loadDetalleEgreso(+this.egreso.egreso);
            this.snackBar.open(res.mensaje, 'Egreso', { duration: 3000 });
          } else {
            this.snackBar.open(`ERROR: ${res.mensaje}`, 'Egreso', { duration: 7000 });
          }
        });
      }
    });
  }  

}
