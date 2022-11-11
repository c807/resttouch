import { OnInit, AfterViewInit, Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../shared/classes/custom-date-adapter';
import { GLOBAL, OrdenarArrayObjetos } from '../../../../shared/global';

import { FormControl, FormGroup } from '@angular/forms';
import { RevStat } from '../reservacion/RevStat';
import * as moment from 'moment';

import { Reserva } from '../../../interfaces/reserva';
import { ReservaService } from '../../../services/reserva.service';
import { TarifaReserva } from '../../../interfaces/tarifa-reserva';
import { TarifaReservaService } from '../../../services/tarifa-reserva.service';
import { ClienteMaster } from '../../../../callcenter/interfaces/cliente-master';
import { ClienteMasterService } from '../../../../callcenter/services/cliente-master.service';

import { Subscription } from 'rxjs';

export interface DialogData {
  roomId: number;
  cDate: string;
  roomIdType: number;
  reserva?: Reserva;
}

@Component({
  selector: 'app-reservation-dialog',
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.css'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class ReservationDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  public range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  public disableSelect = new FormControl(false);
  public reservationTypes = [
    { id: 0, name: RevStat.MANTENIMIENTO },
    { id: 1, name: RevStat.NO_DISPONIBLE },
    { id: 2, name: RevStat.RESERVADA },
    { id: 3, name: RevStat.DISPONIBLE }
  ];
  public selectedResType = this.reservationTypes[0];

  public tarifas: TarifaReserva[] = [];
  public reserva: Reserva;
  public lstClientesMaster: ClienteMaster[] = [];

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private tarifaReservaSrvc: TarifaReservaService,
    private reservaSrvc: ReservaService,
    private clienteMasterSrvc: ClienteMasterService
  ) { }

  ngOnInit(): void {
    // console.log('DATA = ', this.data)
    this.resetReserva();
    this.loadTarifasReserva();
    this.loadClientesMaster();
  }

  ngAfterViewInit(): void {
    this.range = new FormGroup({
      start: new FormControl(moment(this.data.cDate).toDate()),
      end: new FormControl(),
    });

    if (this.data.reserva) {
      this.reserva = JSON.parse(JSON.stringify(this.data.reserva));
    } else {
      this.resetReserva();
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  loadTarifasReserva = () => {
    this.endSubs.add(
      this.tarifaReservaSrvc.get({ tipo_habitacion: this.data.roomIdType }).subscribe(res => this.tarifas = res)
    );
  }

  loadClientesMaster = () => {
    this.endSubs.add(
      this.clienteMasterSrvc.get().subscribe(res => this.lstClientesMaster = OrdenarArrayObjetos(res, 'nombre'))
    );
  }

  resetReserva = () => {
    this.reserva = {
      reserva: null,
      mesa: this.data.roomId || null,
      tarifa_reserva: null,
      cliente_master: null,
      estatus_reserva: null,
      fecha_del: moment(this.range.get('start').value).isValid() ? moment(this.range.get('start').value).format(GLOBAL.dbDateFormat) : null,
      fecha_al: null,
      cantidad_adultos: null,
      cantidad_menores: null
    }
    // console.log('ON RESET = ', this.reserva);
  }

  public Disponible(): String {
    return RevStat.DISPONIBLE;
  }

  public Reservada(): String {
    return RevStat.RESERVADA;
  }

  public Mantenimiento(): String {
    return RevStat.MANTENIMIENTO;
  }

  public NoDisponible(): String {
    return RevStat.NO_DISPONIBLE;
  }

  public select(value): void {
    this.selectedResType = this.reservationTypes[value];
  }

  public addReservation(): void {
    //Get the number of days in range

    this.reserva.fecha_del = moment(this.range.value.start).format(GLOBAL.dbDateFormat);
    this.reserva.fecha_al = moment(this.range.value.end).format(GLOBAL.dbDateFormat);

    console.log('RESERVA = ', this.reserva);

    this.dialogRef.close();
  }

  public selectTarifa = () => {
    const adultos = +this.reserva.cantidad_adultos || 0;
    const menores = +this.reserva.cantidad_menores || 0;
    let tarifaSeleccionada: TarifaReserva;
    switch (true) {
      case adultos > 0 && menores > 0: tarifaSeleccionada = this.tarifas.find(t => adultos <= +t.cantidad_adultos && menores <= +t.cantidad_menores); break;      
      case adultos > 0 && menores === 0: tarifaSeleccionada = this.tarifas.find(t => adultos <= +t.cantidad_adultos); break;
      case adultos === 0 && menores > 0: tarifaSeleccionada = this.tarifas.find(t => menores <= +t.cantidad_menores); break;
    }
    
    if (tarifaSeleccionada && tarifaSeleccionada.tarifa_reserva) {      
      this.reserva.tarifa_reserva = tarifaSeleccionada.tarifa_reserva;
    } else {
      this.reserva.tarifa_reserva = null;
    }    
  }
}
