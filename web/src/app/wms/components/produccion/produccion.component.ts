import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { FormIngresoComponent } from '@wms-components/ingreso/form-ingreso/form-ingreso.component';

import { TransformacionIngreso } from '@wms-interfaces/transformacion';
import { TransformacionService } from '@wms-services/transformacion.service';
import { Ingreso } from '@wms-interfaces/ingreso';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-produccion',
  templateUrl: './produccion.component.html',
  styleUrls: ['./produccion.component.css']
})
export class ProduccionComponent implements OnInit, OnDestroy {

  @ViewChild('frmIngreso') frmIngreso: FormIngresoComponent;
  public ingreso: Ingreso;
  public produccion: TransformacionIngreso;
  public bloqueoBotones = false;

  private endSubs = new Subscription();

  constructor(
    private ls: LocalstorageService,
    private snackBar: MatSnackBar,
    private transformacionSrvc: TransformacionService
  ) { }

  ngOnInit() {
    this.ingreso = {
      ingreso: null, tipo_movimiento: null, fecha: moment().format(GLOBAL.dbDateFormat), bodega: null,
      usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), comentario: null, proveedor: null
    };
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  transformar = () => {
    this.bloqueoBotones = true;
    this.ingreso = this.frmIngreso.ingreso;

    this.produccion = {
      tipo_movimiento: this.ingreso.tipo_movimiento,
      fecha: this.ingreso.fecha,
      proveedor: this.ingreso.proveedor,
      bodega: this.ingreso.bodega,
      usuario: this.ingreso.usuario,
      bodega_origen: this.ingreso.bodega_origen,
      comentario: this.ingreso.comentario,
      detalle: []
    };

    this.frmIngreso.detallesIngreso.forEach(di => this.produccion.detalle.push({
      articulo: di.articulo,
      cantidad: di.cantidad,
      precio_unitario: di.precio_unitario,
      precio_total: di.precio_total,
      presentacion: di.presentacion
    }));

    if (
      !!this.produccion && !!this.produccion.detalle && this.produccion.detalle.length > 0
    ) {
      this.endSubs.add(
        this.transformacionSrvc.producir(this.produccion).subscribe(res => {
          this.bloqueoBotones = false;
          if (res.exito) {
            this.frmIngreso.resetIngreso();
            this.frmIngreso.detallesIngreso = [];
            this.snackBar.open('Producto generado con éxito...', 'Producción', { duration: 5000 });
          } else {
            this.snackBar.open(`ERROR: ${res.mensaje}`, 'Producción', { duration: 3000 });
          }
        })
      );
    } else {
      this.bloqueoBotones = false;
      this.snackBar.open(`Faltan datos necesario. Favor complete los datos e intente de nuevo.`, 'Transformación', { duration: 3000 });
    }
  }

  doSomething = () => { }

}
