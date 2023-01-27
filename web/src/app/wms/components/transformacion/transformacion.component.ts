import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { FormEgresoComponent } from '@wms-components/egreso/form-egreso/form-egreso.component';
import { FormIngresoComponent } from '@wms-components/ingreso/form-ingreso/form-ingreso.component';

import { Transformacion, TransformacionDetalleMovimiento } from '@wms-interfaces/transformacion';
import { TransformacionService } from '@wms-services/transformacion.service';
import { Ingreso } from '@wms-interfaces/ingreso';
import { Egreso } from '@wms-interfaces/egreso';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transformacion',
  templateUrl: './transformacion.component.html',
  styleUrls: ['./transformacion.component.css']
})
export class TransformacionComponent implements OnInit, OnDestroy {

  @ViewChild('frmEgreso') frmEgreso: FormEgresoComponent;
  @ViewChild('frmIngreso') frmIngreso: FormIngresoComponent;

  public transformacion: Transformacion;
  public mermaDetalle: TransformacionDetalleMovimiento[] = [];
  public merma: TransformacionDetalleMovimiento;
  public ingreso: Ingreso;
  public egreso: Egreso;
  public showMerma: boolean = true;
  public bloqueoBotones = false;

  private endSubs = new Subscription();

  constructor(
    private ls: LocalstorageService,
    private _snackBar: MatSnackBar,
    private transformacionSrvc: TransformacionService
  ) { }

  ngOnInit() {
    this.egreso = {
      egreso: null, tipo_movimiento: null, bodega: null, fecha: moment().format(GLOBAL.dbDateFormat), usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), estatus_movimiento: 1, traslado: 0
    };

    this.ingreso = {
      ingreso: null, tipo_movimiento: null, fecha: moment().format(GLOBAL.dbDateFormat), bodega: null, usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), comentario: null, proveedor: null
    };
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  doSomething() { }

  transformar = () => {
    this.bloqueoBotones = true;
    this.egreso = this.frmEgreso.egreso;
    this.ingreso = this.frmIngreso.ingreso;

    this.transformacion = {
      egreso: {
        tipo_movimiento: this.egreso.tipo_movimiento,
        fecha: this.egreso.fecha,
        proveedor: this.ingreso.proveedor,
        bodega: this.egreso.bodega,
        usuario: this.egreso.usuario,
        estatus_movimiento: this.egreso.estatus_movimiento,
        bodega_destino: this.egreso.bodega_destino,
        tipo_movimiento_destino: this.egreso.tipo_movimiento_destino,
        detalle: []
      },
      ingreso: {
        tipo_movimiento: this.ingreso.tipo_movimiento,
        fecha: this.ingreso.fecha,
        proveedor: this.ingreso.proveedor,
        bodega: this.ingreso.bodega,
        usuario: this.ingreso.usuario,
        bodega_origen: this.ingreso.bodega_origen,
        comentario: this.ingreso.comentario,
        detalle: []
      },
      merma: []
    }

    this.frmEgreso.detallesMerma.forEach(dm => this.transformacion.merma.push({
      articulo: dm.articulo,
      cantidad: dm.cantidad,
      precio_unitario: dm.precio_unitario,
      precio_total: dm.precio_total,
      presentacion: dm.presentacion,
      cantidad_utilizada: dm.cantidad_utilizada
    }));

    this.frmEgreso.detallesEgreso.forEach(de => this.transformacion.egreso.detalle.push({
      articulo: de.articulo,
      cantidad: de.cantidad,
      precio_unitario: de.precio_unitario,
      precio_total: de.precio_total,
      presentacion: de.presentacion
    }));

    this.frmIngreso.detallesIngreso.forEach(di => this.transformacion.ingreso.detalle.push({
      articulo: di.articulo,
      cantidad: di.cantidad,
      precio_unitario: di.precio_unitario,
      precio_total: di.precio_total,
      presentacion: di.presentacion,
      cantidad_utilizada: di.cantidad_utilizada
    }));

    if (
      !!this.transformacion.egreso && !!this.transformacion.egreso.detalle && this.transformacion.egreso.detalle.length > 0 &&
      !!this.transformacion.ingreso && !!this.transformacion.ingreso.detalle && this.transformacion.ingreso.detalle.length > 0
    ) {
      this.endSubs.add(        
        this.transformacionSrvc.transformar(this.transformacion).subscribe(res => {
          this.bloqueoBotones = false;
          if (res.exito) {
            this.frmEgreso.resetEgreso();
            this.frmEgreso.detallesEgreso = [];
            this.frmEgreso.resetDetalleMerma();
            this.frmEgreso.detallesMerma = [];
            this.frmIngreso.resetIngreso();
            this.frmIngreso.detallesIngreso = [];
            this._snackBar.open('Transformación generada con éxito...', 'Transformación', { duration: 5000 });
          } else {
            this._snackBar.open(`ERROR: ${res.mensaje}`, 'Transformación', { duration: 3000 });
          }
        })
      );
    } else {
      this.bloqueoBotones = false;
      this._snackBar.open(`Faltan datos necesario. Favor complete los datos e intente de nuevo.`, 'Transformación', { duration: 3000 });      
    }
  }
}
