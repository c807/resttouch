import { OnInit, AfterViewInit, Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomDateAdapter, CUSTOM_DATE_FORMATS } from '@shared-classes/custom-date-adapter';
import { GLOBAL, OrdenarArrayObjetos } from '@shared/global';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { Socket } from 'ngx-socket-io';

import { FormControl, FormGroup } from '@angular/forms';
import { RevStat } from '@hotel-components/booker/reservacion/RevStat';
import * as moment from 'moment';

import { Reserva } from '@hotel-interfaces/reserva';
import { ReservaService } from '@hotel-services/reserva.service';
import { TarifaReserva } from '@hotel-interfaces/tarifa-reserva';
import { TarifaReservaService } from '@hotel-services/tarifa-reserva.service';
import { EstatusReserva } from '@hotel-interfaces/estatus-reserva';
import { EstatusReservaService } from '@hotel-services/estatus-reserva.service';
import { ClienteMaster } from '@callcenter-interfaces/cliente-master';
import { ClienteMasterService } from '@callcenter-services/cliente-master.service';
import { ClienteMasterDialogComponent } from '@callcenter-components/cliente-master/cliente-master-dialog/cliente-master-dialog.component';
import { ComandaService } from '@restaurante-services/comanda.service';
import { DialogSelectReservableComponent } from '@hotel-components/dialog-select-reservable/dialog-select-reservable.component';

import { Subscription } from 'rxjs';

export interface DialogData {
  roomId: number;
  cDate: string;
  roomIdType: number;
  reserva?: Reserva;
  idReservacion?: number;
  descripcionHabitacion?: string;
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

  get diaSalida() {
    return moment(this.range.value.end).isValid() ? moment(this.range.value.end).add(1, 'day').format(GLOBAL.dateFormat) : null;
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
  public startDate = moment().toDate();
  public idEstatusReservaInicial = 0;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private tarifaReservaSrvc: TarifaReservaService,
    private reservaSrvc: ReservaService,
    private clienteMasterSrvc: ClienteMasterService,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private comandaSrvc: ComandaService,
    private socket: Socket,
    public dialog: MatDialog,
    public estatusReservaSrvc: EstatusReservaService,
  ) { }

  ngOnInit() {
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);
      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));
    }
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
    // this.tarifas = await this.tarifaReservaSrvc.get({ tipo_habitacion: this.data.roomIdType }).toPromise();
    this.tarifas = await this.tarifaReservaSrvc.get().toPromise();
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
      this.idEstatusReservaInicial = +this.reserva.estatus_reserva;
      this.range.setValue({
        start: moment(this.reserva.fecha_del).toDate(),
        end: moment(this.reserva.fecha_al).toDate()
      });
      this.txtClienteMasterSelected = this.filteredLstClientesMaster.find(cm => +cm.cliente_master === +this.reserva.cliente_master);
    }
  }

  addReservation(): void {
    //Get the number of days in range

    this.reserva.fecha_del = moment(this.range.value.start).format(GLOBAL.dbDateFormat);
    this.reserva.fecha_al = moment(this.range.value.end).format(GLOBAL.dbDateFormat);
    if (this.reserva && (this.reserva.estatus_reserva === null || this.reserva.estatus_reserva === undefined)) {
      this.reserva.estatus_reserva = 1;
    }

    // console.log('RESERVA = ', this.reserva);

    const msgCheckIn = this.reserva && +this.reserva.estatus_reserva === 2 ? ' Al hacer el check-in se abrirá automáticamente una cuenta para el cliente. ' : '';
    let continuar = true;

    if (this.reserva && +this.reserva.estatus_reserva === 2)
    {
      const hoy = moment(`${moment().format(GLOBAL.dbDateFormat)} 00:00:00`);
      const fechaInicioReserva = moment(`${moment(this.reserva.fecha_del).format(GLOBAL.dbDateFormat)} 00:00:00`);
      if (hoy.isBefore(fechaInicioReserva)) {
        continuar = false;        
      }
    }

    if (continuar) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel(
          'Reservación',
          `Esto ${this.reserva && +this.reserva.reserva > 0 ? (+this.reserva.estatus_reserva === 4 ? 'cancelará la' : 'modificará la') : 'generará una nueva'} reserva.${msgCheckIn} ¿Desea continuar?`,
          'Sí', 'No'
        )
      });
  
      this.endSubs.add(
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            this.endSubs.add(
              this.reservaSrvc.save(this.reserva).subscribe(res => {
                this.snackBar.open((res.exito ? '' : 'ERROR: ') + res.mensaje, 'Reserva', { duration: 7000 });
                if (res.exito && res.reserva && +res.reserva.estatus_reserva === 2) {
                  this.abrirComandaDeHabitacion(res.reserva as Reserva);
                } else {
                  this.dialogRef.close();
                }
              })
            );
          } else {
            this.dialogRef.close();
          }
        })
      );
    } else {
      this.snackBar.open('No puede hacer CHECK-IN de una reserva futura.', 'Reserva', { duration: 7000 });
    }
  }

  selectTarifa = () => {
    this.reserva.cantidad_adultos = Math.abs(+this.reserva.cantidad_adultos || 0);
    this.reserva.cantidad_menores = Math.abs(+this.reserva.cantidad_menores || 0);
    const adultos = this.reserva.cantidad_adultos;
    const menores = this.reserva.cantidad_menores;
    let tarifaSeleccionada: TarifaReserva;
    switch (true) {
      case adultos > 0 && menores > 0: tarifaSeleccionada = this.tarifas.find(t => adultos <= +t.cantidad_adultos && menores <= +t.cantidad_menores && +t.tipo_habitacion === +this.data.roomIdType); break;
      case adultos > 0 && menores === 0: tarifaSeleccionada = this.tarifas.find(t => adultos <= +t.cantidad_adultos && +t.tipo_habitacion === +this.data.roomIdType); break;
      case adultos === 0 && menores > 0: tarifaSeleccionada = this.tarifas.find(t => menores <= +t.cantidad_menores && +t.tipo_habitacion === +this.data.roomIdType); break;
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
      this.filteredLstClientesMaster = this.lstClientesMaster.filter(cm => cm.nombre.toLowerCase().includes(filterValue) || cm.numero_documento?.toLowerCase().includes(filterValue));
    } else {
      this.filteredLstClientesMaster = this.lstClientesMaster;
    }
  }

  abrirComandaDeHabitacion = (rsv: Reserva) => {
    // console.log(rsv);

    const cliMas = this.lstClientesMaster.find(c => +c.cliente_master === +rsv.cliente_master);

    const comandaReserva: any = {
      nombreArea: '',
      area: +rsv.area,
      mesa: +rsv.mesa,
      numero: +rsv.numero_mesa,
      mesero: this.ls.get(GLOBAL.usrTokenVar).idusr,
      comensales: +rsv.cantidad_adultos + +rsv.cantidad_menores,
      comanda: 0,
      esevento: 0,
      dividirCuentasPorSillas: false,
      estatus: 1,
      clientePedido: null,
      reserva: +this.reserva.reserva,
      cuentas: [
        {
          numero: 1,
          nombre: cliMas?.nombre || 'Unica',
          productos: []
        }
      ]
    };

    this.endSubs.add(
      this.comandaSrvc.save(comandaReserva).subscribe(res => {
        if (res.exito) {
          this.socket.emit('refrescar:mesa', {});
          const comandaCreada = res.comanda;
          const msg = `Comanda #${comandaCreada.comanda} para la habitación #${comandaCreada.mesa.etiqueta || comandaCreada.mesa.numero} del área ${comandaCreada.mesa.area.nombre} creada.`;
          this.snackBar.open(msg, 'Reserva', { duration: 7000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Reserva', { duration: 7000 });
        }
        this.dialogRef.close();
      })
    );
  }

  agregarCobroHabitacion = () => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Reservación',
        `Esto agregará un cobro de habitación en la comanda generada para esta reserva. Si lo desea eliminar deberá hacerlo directamente de la comanda. ¿Desea continuar?`,
        'Sí', 'No'
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.endSubs.add(
            this.reservaSrvc.agregarCobroHabitacion({ reserva: this.reserva.reserva }).subscribe(res => {
              this.reserva.cobradoencomanda = res.exito ? 1 : 0;
              this.snackBar.open(`${res.exito ? '' : 'ERROR: '}${res.mensaje}`, 'Reserva', { duration: 7000 });
            })
          );
        }
      })
    );
  }

  agregarNuevoClienteMaster = () => {

    const obj: ClienteMaster = {
      cliente_master: null, nombre: null, correo: null, fecha_nacimiento: null, tipo_documento: null, numero_documento: null
    };

    const cmdRef = this.dialog.open(ClienteMasterDialogComponent, {
      maxWidth: '100vw', maxHeight: '85vh', width: '99vw', height: '85vh',
      disableClose: true,
      data: { clienteMaster: obj }
    });

    this.endSubs.add(
      cmdRef.afterClosed().subscribe(() => {
        this.loadClientesMaster();
      })
    );
  }

  cancelarReservacion = () => {
    this.reserva.estatus_reserva = 4;
    this.addReservation();
  }

  cambiarHabitacion = () => {
    const dialogRef = this.dialog.open(DialogSelectReservableComponent, {
      width: '50%',
      data: { }
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe((habitacion_destino: number = 0) => {
        if (+habitacion_destino > 0) {
          const obj = {
            reserva: +this.reserva.reserva,
            mesa_destino: +habitacion_destino            
          }
          this.endSubs.add(
            this.reservaSrvc.cambiarHabitacion(obj).subscribe(res => {
              this.snackBar.open(`${res.exito ? '' : 'ERROR: '}${res.mensaje}`, 'Reserva', { duration: 7000 });
              this.dialogRef.close();
            })
          );
        } else {
          this.snackBar.open(`Por favor seleccione una habitación.`, 'Reserva', { duration: 7000 });
          this.dialogRef.close();
        }
      })
    );
  }

  filtroFecha = (d: Date | null): boolean => {
    const hoy = moment(`${moment().format(GLOBAL.dbDateFormat)} 00:00:00`);
    const fecha = moment(`${moment(d).format(GLOBAL.dbDateFormat)} 00:00:00`);
    return hoy.isBefore(fecha) || hoy.isSame(fecha);
  }
}
