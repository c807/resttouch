import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {LocalstorageService} from '../../../../admin/services/localstorage.service';
import {GLOBAL} from '../../../../shared/global';

import {OrdenCompra} from '../../../interfaces/orden-compra';
import {DetalleOrdenCompra} from '../../../interfaces/detalle-orden-compra';
import {OrdenCompraService} from '../../../services/orden-compra.service';
import {Proveedor} from '../../../../wms/interfaces/proveedor';
import {ProveedorService} from '../../../../wms/services/proveedor.service';
import {TipoMovimiento} from '../../../../wms/interfaces/tipo-movimiento';
import {TipoMovimientoService} from '../../../../wms/services/tipo-movimiento.service';
import {Bodega} from '../../../../wms/interfaces/bodega';
import {BodegaService} from '../../../../wms/services/bodega.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {ReportePdfService} from '../../../../restaurante/services/reporte-pdf.service';
import * as moment from 'moment';
import {saveAs} from 'file-saver';

import {Subscription} from 'rxjs';
import {MatSelectChange} from '@angular/material/select';
import {Articulo} from "../../../../wms/interfaces/articulo";
import {Presentacion} from "../../../../admin/interfaces/presentacion";

@Component({
  selector: 'app-form-orden-compra',
  templateUrl: './form-orden-compra.component.html',
  styleUrls: ['./form-orden-compra.component.css']
})
export class FormOrdenCompraComponent implements OnInit, OnDestroy {

  @Input() ordenCompra: OrdenCompra;
  @Output() ordenCompraSavedEv = new EventEmitter();

  public txtProveedorSelected: (Proveedor | string) = undefined;

  public showOrdenCompraForm = true;
  public showDetalleOrdenCompraForm = true;

  public detallesOrdenCompra: DetalleOrdenCompra[] = [];
  public detalleOrdenCompra: DetalleOrdenCompra;
  public displayedColumns: string[] = ['articulo', 'cantidad', 'monto', 'total', 'editItem'];
  public dataSource: MatTableDataSource<DetalleOrdenCompra>;
  public proveedores: Proveedor[] = [];
  public articulos: any[] = [];
  public tiposMovimiento: TipoMovimiento[] = [];
  public bodegas: Bodega[] = [];
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public presentaciones: any[] = [];
  public bloqueoMonto = false;
  public fltrPresentaciones: Presentacion[] = [];

  public filteredArticulos: Articulo[] = [];
  public txtArticuloSelected: (Articulo | string) = undefined;
  public filteredProveedores: Proveedor[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private ordenCompraSrvc: OrdenCompraService,
    private proveedorSrvc: ProveedorService,
    private tipoMovimientoSrvc: TipoMovimientoService,
    private bodegaSrvc: BodegaService,
    public dialog: MatDialog,
    private pdfServicio: ReportePdfService
  ) {
  }

  setProviderName() {
    const filteredProveedores =
      this.proveedores.filter(a => a.proveedor === this.ordenCompra.proveedor);

    //  this.txtProveedorSelected = this.displayProveedor(filteredProveedores[0]);
    this.txtProveedorSelected = filteredProveedores[0];
  }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetOrdenCompra();
    this.loadProveedores();
    this.loadBodegas();
    this.loadTiposMovimiento();
  }

  /**
   * Filer article selector
   */

  displayArticulo = (art: Articulo) => {
    if (art) {
      return art.descripcion;
    }
    return undefined;
  }

  filtrarArticulos = (value: (Articulo | string)) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();

      const filterArt = JSON.parse(JSON.stringify(this.articulos));

      const filteredArticulosA =
        filterArt[0].articulos.filter(a => a.descripcion.toLowerCase().includes(filterValue));

      const filteredArticulosB =
        filterArt[1].articulos.filter(a => a.descripcion.toLowerCase().includes(filterValue));


      filterArt[0].articulos = filteredArticulosA;
      filterArt[1].articulos = filteredArticulosB;
      this.filteredArticulos = filterArt;
    } else {
      this.filteredArticulos = this.articulos;
    }
  }
  /**
   * This is for filtering data in the Proveedr filed
   * @param value
   */

  filtrarProveedores = (value) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredProveedores =
        this.proveedores.filter(a => a.razon_social.toLowerCase().includes(filterValue) || a.nit.toLowerCase().includes(filterValue));
    } else {
      this.filteredProveedores = this.proveedores;
    }
  }

  //HERE THE PROVEED IS SET , TO THE OBJECT
  displayProveedor = (p: Proveedor) => {
    if (p) {
      this.ordenCompra.proveedor = p.proveedor;
      return `(${p.nit}) ${p.razon_social}`;
    }
    return undefined;
  }


  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadProveedores = () => {
    this.endSubs.add(
      this.proveedorSrvc.get().subscribe(res => {
        this.proveedores = res;
      })
    );
  }

  loadTiposMovimiento = () => {
    this.endSubs.add(
      this.tipoMovimientoSrvc.get({ingreso: 1}).subscribe(res => {
        this.tiposMovimiento = res;
      })
    );
  }

  loadBodegas = () => {
    this.endSubs.add(
      this.bodegaSrvc.get({sede: this.ls.get(GLOBAL.usrTokenVar).sede || 0}).subscribe(res => {
        this.bodegas = res;
      })
    );
  }

  resetOrdenCompra = () => {
    this.ordenCompra = {
      orden_compra: null,
      proveedor: null, usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), notas: null,
      estatus_movimiento: 1, bodega: null, tipo_movimiento: null, fecha_orden: moment().format(GLOBAL.dbDateFormat),
      sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0)
    };
    this.resetDetalleOrdenCompra();
    this.txtProveedorSelected = undefined;
  }

  onSubmit = () => {
    this.ordenCompraSrvc.save(this.ordenCompra).subscribe(res => {
      // console.log(res);
      if (res.exito) {
        this.ordenCompraSavedEv.emit();
        this.resetOrdenCompra();
        this.ordenCompra = {
          orden_compra: +res.compra.orden_compra,
          sede: res.compra.sede,
          proveedor: res.compra.proveedor,
          fecha_orden: res.compra.fecha_orden,
          fecha: res.compra.fecha,
          usuario: res.compra.usuario,
          notas: res.compra.notas,
          estatus_movimiento: +res.compra.estatus_movimiento
        };
        this.loadDetalleOrdenCompra(this.ordenCompra.orden_compra);
      }
    });
  }


  loadArticulos = () => {
    // console.log(this.ordenCompra);
    const params = {
      sede: this.ls.get(GLOBAL.usrTokenVar).sede || 0,
      proveedor: this.ordenCompra.proveedor || 0
    };

    this.endSubs.add(
      this.ordenCompraSrvc.getArticulosPorProveedor(params).subscribe(res => {
        this.articulos = res;
        this.filteredArticulos = res;
      })
    );
  }

  resetDetalleOrdenCompra() {
    this.detalleOrdenCompra = {
      orden_compra_detalle: null,
      orden_compra: (!!this.ordenCompra.orden_compra ? this.ordenCompra.orden_compra : null),
      articulo: null,
      cantidad: null,
      monto: null,
      total: null,
      presentacion: null
    }
    this.txtArticuloSelected = undefined;
  }

  loadDetalleOrdenCompra = (idoc: number = +this.ordenCompra.orden_compra) => {
    this.loadArticulos();
    this.endSubs.add(
      this.ordenCompraSrvc.getDetalle(idoc, {orden_compra: idoc}).subscribe(res => {
        this.detallesOrdenCompra = res;
        this.updateTableDataSource();
      })
    );
  }

  getDetalleOrdenCompra = (idoc: number = +this.ordenCompra.orden_compra, iddetalle: number) => {
    this.ordenCompraSrvc.getDetalle(idoc, {orden_compra_detalle: iddetalle}).subscribe((res: any[]) => {
      // console.log(res);
      if (res) {
        this.detalleOrdenCompra = {
          orden_compra_detalle: res[0].orden_compra_detalle,
          orden_compra: res[0].orden_compra,
          articulo: res[0].articulo.articulo,
          presentacion: null,
          cantidad: +res[0].cantidad,
          monto: +res[0].monto,
          total: +res[0].total
        };

        this.loadPresentacionesArticulo(+this.detalleOrdenCompra.articulo);
        this.detalleOrdenCompra.presentacion = res[0].presentacion.presentacion;
        this.loadUltimoCostoPresentacion(+this.detalleOrdenCompra.presentacion, false);
        this.showDetalleOrdenCompraForm = true;
      }
    });
  }

  onSubmitDetail = () => {
    this.detalleOrdenCompra.orden_compra = this.ordenCompra.orden_compra;
    // console.log('DET = ', this.detalleOrdenCompra); return;
    this.endSubs.add(
      this.ordenCompraSrvc.saveDetalle(this.detalleOrdenCompra).subscribe(res => {
        // console.log(res);
        if (res) {
          this.loadDetalleOrdenCompra();
          this.resetDetalleOrdenCompra();
          this.presentaciones = [];
        }
      })
    );
  }

  updateTableDataSource = () => this.dataSource = new MatTableDataSource(this.detallesOrdenCompra);

  generarIngreso = () => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Generar Ingreso',
        'Luego de generar el ingreso, no podrá modificar la orden de compra. ¿Desea continuar?',
        'Sí', 'No'
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.ordenCompra.estatus_movimiento = 2;
          this.onSubmit();
        }
      })
    );
  }

  loadPresentacionesArticulo = (idArticulo) => {
    for (const prov of this.articulos) {
      for (const art of prov.articulos) {
        if (+idArticulo === +art.articulo) {
          this.txtArticuloSelected = art;
          this.presentaciones = art.presentaciones;
          this.detalleOrdenCompra.articulo = art.articulo;
          break;
        }
      }
    }
  }

  articuloSelected = (obj) => this.loadPresentacionesArticulo(obj.option.value);

  loadUltimoCostoPresentacion = (idPresentacion: number, changeMonto: boolean = true) => {
    for (const prov of this.articulos) {
      for (const art of prov.articulos) {
        if (+this.detalleOrdenCompra.articulo === +art.articulo) {
          for (const pres of art.presentaciones) {
            if (+idPresentacion === +pres.presentacion) {
              if (pres.ultimo_costo !== null && pres.ultimo_costo !== undefined) {
                this.bloqueoMonto = true;
                if (changeMonto) {
                  this.detalleOrdenCompra.monto = +pres.ultimo_costo;
                  if (+this.detalleOrdenCompra.cantidad > 0) {
                    this.detalleOrdenCompra.total = +pres.ultimo_costo * +this.detalleOrdenCompra.cantidad;
                  }
                }
              } else {
                this.bloqueoMonto = false;
              }
              break;
            }
          }
        }
      }
    }
  }

  presentacionSelected = (obj: MatSelectChange) => this.loadUltimoCostoPresentacion(+obj.value);

  imprimirOC = () => {
    this.endSubs.add(
      this.pdfServicio.getOrdenCompra(+this.ordenCompra.orden_compra).subscribe(res => {
        if (res) {
          const blob = new Blob([res], {type: 'application/pdf'});
          saveAs(blob, `OC_${this.ordenCompra.orden_compra}_${moment().format(GLOBAL.dateTimeFormatRptName)}.pdf`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'OC', {duration: 3000});
        }
      })
    );
  }

  getTotal = () => this.detallesOrdenCompra.map(d => +d.total).reduce((acc, curr) => acc + curr, 0);
}
