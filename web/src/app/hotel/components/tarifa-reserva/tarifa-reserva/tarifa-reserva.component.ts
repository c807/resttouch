import { Component, OnInit, OnDestroy } from '@angular/core';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoHabitacion } from '@hotel-interfaces/tipo-habitacion';
import { TarifaReserva } from '@hotel-interfaces/tarifa-reserva';
import { TarifaReservaService } from '@hotel-services/tarifa-reserva.service';
import { ArticuloService } from '@wms-services/articulo.service';
import { Articulo } from '@wms-interfaces/articulo';

import { Subscription } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tarifa-reserva',
  templateUrl: './tarifa-reserva.component.html',
  styleUrls: ['./tarifa-reserva.component.css']
})
export class TarifaReservaComponent implements OnInit, OnDestroy {

  get tresFaltante() {
    return (tares: TarifaReserva) => (
      tares.cantidad_adultos === null ||
      tares.cantidad_adultos === undefined
    ) || (
        tares.cantidad_menores === null ||
        tares.cantidad_menores === undefined
      ) || (
        tares.monto === null || tares.monto === undefined
      ) || +tares.cantidad_adultos < 0 || +tares.cantidad_menores < 0 || +tares.monto < 0 || +tares.monto_adicional_adulto < 0 || +tares.monto_adicional_menor < 0 || !tares.articulo;
  }

  get tarifaReservaFaltante(): boolean {
    return (this.tarifaReserva.cantidad_adultos === null || this.tarifaReserva.cantidad_adultos === undefined) || (this.tarifaReserva.cantidad_menores === null || this.tarifaReserva.cantidad_menores === undefined) || (this.tarifaReserva.monto === null || this.tarifaReserva.monto === undefined) || +this.tarifaReserva.cantidad_adultos < 0 || +this.tarifaReserva.cantidad_menores < 0 || +this.tarifaReserva.monto < 0 || +this.tarifaReserva.monto_adicional_adulto < 0 || +this.tarifaReserva.monto_adicional_menor < 0 || !this.tarifaReserva.articulo;
  }

  public tipoHabitacion: TipoHabitacion;
  public tarifasReserva: TarifaReserva[] = [];
  public tarifaReserva: TarifaReserva;
  public lstArticuloHabitacion: Articulo[] = [];
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private tarifaReservaSrvc: TarifaReservaService,
    private articuloSrvc: ArticuloService,
    public dialog: MatDialog,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.resetTarifaReserva();
    this.loadArticulosHabitacion();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetTarifaReserva = () => {
    this.tarifaReserva = {
      tarifa_reserva: null,
      tipo_habitacion: this.tipoHabitacion?.tipo_habitacion || null,
      cantidad_adultos: null,
      cantidad_menores: null,
      debaja: 0,
      fechabaja: null,
      usuariobaja: null,
      monto: null,
      monto_adicional_adulto: 0,
      monto_adicional_menor: 0,
      articulo: null
    }
  }

  loadArticulosHabitacion = () => {
    const fltr = {
      _todos: 1, impuesto_especial: 1, debaja: 0, sede: this.ls.get(GLOBAL.usrTokenVar).sede || 0, mostrar_pos: 1
    }
    this.endSubs.add(
      this.articuloSrvc.getArticulos(fltr, true).subscribe(res => this.lstArticuloHabitacion = res)
    );
  }

  loadTarifasReserva = (fltr: any = {}) => {
    this.cargando = true;
    if (this.tipoHabitacion && +this.tipoHabitacion.tipo_habitacion > 0) {
      fltr.tipo_habitacion = +this.tipoHabitacion.tipo_habitacion;
    }
    this.endSubs.add(
      this.tarifaReservaSrvc.get(fltr).subscribe(res => {
        this.tarifasReserva = res;
        this.cargando = false;
      })
    );
  }

  guardarTarifa = (tr: TarifaReserva) => {
    this.cargando = true;
    this.endSubs.add(
      this.tarifaReservaSrvc.save(tr).subscribe(res => {
        this.resetTarifaReserva();
        this.loadTarifasReserva();
      })
    );
  }
  
  darDeBaja = (tarifa: TarifaReserva) => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        `Tarifa para ${tarifa.cantidad_adultos} adultos y ${tarifa.cantidad_menores} menores`,
        `Luego de dar de baja esta tarifa, no podrá utilizarla en ninguna transacción de RSV . ¿Desea continuar?`,
        'Sí',
        'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          tarifa.debaja = 1;
          this.guardarTarifa(tarifa);
        }
      })
    );
  }
}
