import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../shared/global';

import { OrdenCompra } from '../../../interfaces/orden-compra';
import { DetalleOrdenCompra } from '../../../interfaces/detalle-orden-compra';
import { OrdenCompraService } from '../../../services/orden-compra.service';
import { Proveedor } from '../../../../wms/interfaces/proveedor';
import { ProveedorService } from '../../../../wms/services/proveedor.service';
import { ArticuloService } from '../../../../wms/services/articulo.service';
import { TipoMovimiento } from '../../../../wms/interfaces/tipo-movimiento';
import { TipoMovimientoService } from '../../../../wms/services/tipo-movimiento.service';
import { Bodega } from '../../../../wms/interfaces/bodega';
import { BodegaService } from '../../../../wms/services/bodega.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';

import { Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-form-orden-compra',
  templateUrl: './form-orden-compra.component.html',
  styleUrls: ['./form-orden-compra.component.css']
})
export class FormOrdenCompraComponent implements OnInit, OnDestroy {

  @Input() ordenCompra: OrdenCompra;
  @Output() ordenCompraSavedEv = new EventEmitter();

  public showOrdenCompraForm = true;
  public showDetalleOrdenCompraForm = true;

  public detallesOrdenCompra: DetalleOrdenCompra[] = [];
  public detalleOrdenCompra: DetalleOrdenCompra;
  public displayedColumns: string[] = ['articulo', 'cantidad', 'monto', 'total', 'editItem'];
  public dataSource: MatTableDataSource<DetalleOrdenCompra>;
  public proveedores: Proveedor[] = [];
  // public articulos: Articulo[] = [];
  public articulos: any[] = [];
  public tiposMovimiento: TipoMovimiento[] = [];
  public bodegas: Bodega[] = [];
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public presentaciones: any[] = [];
  public bloqueoMonto = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private ordenCompraSrvc: OrdenCompraService,
    private proveedorSrvc: ProveedorService,
    private articuloSrvc: ArticuloService,
    private tipoMovimientoSrvc: TipoMovimientoService,
    private bodegaSrvc: BodegaService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetOrdenCompra();
    this.loadProveedores();
    // this.loadArticulos();
    this.loadBodegas();
    this.loadTiposMovimiento();
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
      this.tipoMovimientoSrvc.get({ ingreso: 1 }).subscribe(res => {
        this.tiposMovimiento = res;
      })
    );
  }

  loadBodegas = () => {
    this.endSubs.add(
      this.bodegaSrvc.get({ sede: this.ls.get(GLOBAL.usrTokenVar).sede || 0 }).subscribe(res => {
        this.bodegas = res;
      })
    );
  }

  resetOrdenCompra = () => {
    this.ordenCompra = {
      orden_compra: null, proveedor: null, usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), notas: null,
      estatus_movimiento: 1, bodega: null, tipo_movimiento: null, fecha_orden: moment().format(GLOBAL.dbDateFormat),
      sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0)
    };
    this.resetDetalleOrdenCompra();
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
      })
    );
  }

  resetDetalleOrdenCompra = () => this.detalleOrdenCompra = {
    orden_compra_detalle: null, orden_compra: (!!this.ordenCompra.orden_compra ? this.ordenCompra.orden_compra : null), articulo: null,
    cantidad: null, monto: null, total: null, presentacion: null
  }

  loadDetalleOrdenCompra = (idoc: number = +this.ordenCompra.orden_compra) => {
    this.loadArticulos();
    this.endSubs.add(
      this.ordenCompraSrvc.getDetalle(idoc, { orden_compra: idoc }).subscribe(res => {
        this.detallesOrdenCompra = res;
        this.updateTableDataSource();
      })
    );
  }

  getDetalleOrdenCompra = (idoc: number = +this.ordenCompra.orden_compra, iddetalle: number) => {
    this.ordenCompraSrvc.getDetalle(idoc, { orden_compra_detalle: iddetalle }).subscribe((res: any[]) => {
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

  loadPresentacionesArticulo = (idArticulo: number) => {
    for (const prov of this.articulos) {
      for (const art of prov.articulos) {
        if (+idArticulo === +art.articulo) {
          this.presentaciones = art.presentaciones;
          break;
        }
      }
    }
  }

  articuloSelected = (obj: MatSelectChange) => this.loadPresentacionesArticulo(+obj.value);

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

}
