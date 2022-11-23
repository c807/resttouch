import { OnInit, AfterViewInit, Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomDateAdapter, CUSTOM_DATE_FORMATS } from '../../../../shared/classes/custom-date-adapter';
import { GLOBAL, OrdenarArrayObjetos } from '../../../../shared/global';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { FormControl, FormGroup } from '@angular/forms';
import { RevStat } from '../reservacion/RevStat';
import * as moment from 'moment';

import { Reserva } from '../../../interfaces/reserva';
import { ReservaService } from '../../../services/reserva.service';
import { TarifaReserva } from '../../../interfaces/tarifa-reserva';
import { TarifaReservaService } from '../../../services/tarifa-reserva.service';
import { EstatusReserva } from '../../../interfaces/estatus-reserva';
import { EstatusReservaService } from '../../../services/estatus-reserva.service';
import { ClienteMaster } from '../../../../callcenter/interfaces/cliente-master';
import { ClienteMasterService } from '../../../../callcenter/services/cliente-master.service';


import { Subscription } from 'rxjs';

export interface DialogData {
  roomId: number;
  cDate: string;
  roomIdType: number;
  reserva?: Reserva;
  idReservacion?: number;
}

@Component({
  selector: 'app-reservation-dialog',
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.css'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class ReservationDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  get reservaLista() {
    return moment(this.range.value.start).isValid && moment(this.range.value.end).isValid() && this.reserva.cantidad_adultos >= 0 && this.reserva.cantidad_menores >= 0 && +this.reserva.cliente_master > 0 && +this.reserva.tarifa_reserva > 0;
  }

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
  public filteredLstClientesMaster: ClienteMaster[] = [];
  public txtClienteMasterSelected: (ClienteMaster | string) = undefined;
  public lstEstatusReserva: EstatusReserva[] = [];

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private tarifaReservaSrvc: TarifaReservaService,
    private reservaSrvc: ReservaService,
    private clienteMasterSrvc: ClienteMasterService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    public estatusReservaSrvc: EstatusReservaService
  ) { }

  ngOnInit() {    
    this.resetReserva();    
  }

  async ngAfterViewInit() {
    this.range = new FormGroup({
      start: new FormControl(moment(this.data.cDate).toDate()),
      end: new FormControl(),
    });

    await this.loadTarifasReserva();
    await this.loadEstatusReserva();
    await this.loadClientesMaster();

    if (+this.data.idReservacion > 0) {
      await this.loadReservacion(+this.data.idReservacion);
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

  loadTarifasReserva = async () => {
    this.tarifas = await this.tarifaReservaSrvc.get({ tipo_habitacion: this.data.roomIdType }).toPromise();
  }
  
  loadEstatusReserva = async () => {
    this.lstEstatusReserva = await this.estatusReservaSrvc.get().toPromise();
  }

  loadClientesMaster = async () => {
    const listaCM = await this.clienteMasterSrvc.get().toPromise();
    this.lstClientesMaster = OrdenarArrayObjetos(listaCM, 'nombre');
    this.filteredLstClientesMaster = JSON.parse(JSON.stringify(this.lstClientesMaster));
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

  loadReservacion = async (reservaId: number) => {
    const rsv = await this.reservaSrvc.get({ reserva: +reservaId }, true).toPromise() as Reserva[];
    if (rsv.length > 0) {
      this.reserva = rsv[0];
      this.range.setValue({
        start: moment(this.reserva.fecha_del).toDate(),
        end: moment(this.reserva.fecha_al).toDate()
      });
      this.txtClienteMasterSelected = this.filteredLstClientesMaster.find(cm => +cm.cliente_master === +this.reserva.cliente_master);
    }
  }

  // public Disponible = (): String => RevStat.DISPONIBLE;

  // public Reservada = (): String => RevStat.RESERVADA;

  // public Mantenimiento = (): String => RevStat.MANTENIMIENTO;

  // public NoDisponible = (): String => RevStat.NO_DISPONIBLE;

  // public select = (value) => this.selectedResType = this.reservationTypes[value];

  public addReservation(): void {
    //Get the number of days in range

    this.reserva.fecha_del = moment(this.range.value.start).format(GLOBAL.dbDateFormat);
    this.reserva.fecha_al = moment(this.range.value.end).format(GLOBAL.dbDateFormat);
    if (this.reserva && (this.reserva.estatus_reserva === null || this.reserva.estatus_reserva === undefined)) {
      this.reserva.estatus_reserva = 1;
    }

    // console.log('RESERVA = ', this.reserva);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Reservación',
        `Esto ${this.reserva && +this.reserva.reserva > 0 ? 'modificará la' : 'generará una nueva'} reserva. ¿Desea continuar?`,
        'Sí', 'No'
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.endSubs.add(
            this.reservaSrvc.save(this.reserva).subscribe(res => {
              this.snackBar.open((res.exito ? '' : 'ERROR: ') + res.mensaje, 'Reserva', { duration: 7000 });
              this.dialogRef.close();
            })
          );
        }
      })
    );
  }

  public selectTarifa = () => {
    this.reserva.cantidad_adultos = Math.abs(+this.reserva.cantidad_adultos || 0);
    this.reserva.cantidad_menores = Math.abs(+this.reserva.cantidad_menores || 0);
    const adultos = this.reserva.cantidad_adultos;
    const menores = this.reserva.cantidad_menores;
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

  displayClienteMaster = (cm: ClienteMaster) => {
    if (cm) {
      this.reserva.cliente_master = cm.cliente_master;
      return cm.nombre + (cm.numero_documento ? ` (${cm.numero_documento})` : '');
    }
    return undefined;
  }

  filtrarClientesMaster = (value: (ClienteMaster | string)) => {
    if (value && (typeof value === 'string')) {
      const filterValue = value.toLowerCase();
      this.filteredLstClientesMaster = this.lstClientesMaster.filter(cm => cm.nombre.toLowerCase().includes(filterValue) || cm.numero_documento.toLocaleLowerCase().includes(filterValue));
    } else {
      this.filteredLstClientesMaster = JSON.parse(JSON.stringify(this.lstClientesMaster));
    }
  }
}
