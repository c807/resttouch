import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { HabType } from './habitacion/HabTypeE';
import { RevStat } from './reservacion/RevStat';
// import { FakeBakend } from './FakeBakend';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ThemePalette } from '@angular/material/core';
import { FilterComponent } from '../booker/filtro/filter.component';
import { GLOBAL } from '../../../shared/global';

import { TipoHabitacion } from '../../../admin/interfaces/tipo-habitacion';
import { TipoHabitacionService } from '../../../admin/services/tipo-habitacion.service';
import { MesaDisponible } from '../../../restaurante/interfaces/mesa';
import { MesaService } from '../../../restaurante/services/mesa.service';
import { ReservaService } from '../../services/reserva.service';

import { Subscription } from 'rxjs';
import { Reserva } from '../../interfaces/reserva';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter, CUSTOM_DATE_FORMATS } from '../../../shared/classes/custom-date-adapter';

export interface DayCalendar {
  martes: (RevStat | string);
  lunes: (RevStat | string);
  miercoles: (RevStat | string);
  jueves: (RevStat | string);
  viernes: (RevStat | string);
  sabado: (RevStat | string);
  domingo: (RevStat | string);
  habitacion: (HabType | string);
  habitacionName: string;
  roomId?: number;
  resL?: number;
  resM?: number;
  resMi?: number;
  resJ?: number;
  resV?: number;
  resS?: number;
  resD?: number;
  roomIdType?: number;
  idReservacion?: number;
}

/**
 * We need to pre process this information.
 * To be able to convert reservations into Element data.
 */
export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}

const ELEMENT_DATA: DayCalendar[] = [];

@Component({
  selector: 'app-bookerc',
  templateUrl: './booker.component.html',
  styleUrls: ['./booker.component.css'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    // { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ]
})
export class BookerComponent implements OnInit, AfterViewInit, OnDestroy {

  // @ViewChild(MatTable, { static: true }) tblReservas: MatTable<any>;
  @ViewChild('tblReservas') tblReservas: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('fltrTipoHabitacion') fltrTipoHabitacion: FilterComponent;

  public allComplete = false;
  public selected: Date | null;
  public sdate = new Date();
  public displayedColumns: string[] = ['habitacion', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  public reservationIdDays: string[] = ['blank', 'resL', 'resM', 'resMi', 'resJ', 'resV', 'resS', 'resD'];
  public dataSource = new MatTableDataSource<DayCalendar>(ELEMENT_DATA);
  public dataSourceTemp = ELEMENT_DATA;
  // public roomArr = FakeBakend.RoomArrTypesFilter;
  public roomArr = [];
  public monDate = new Date();
  public marDate = new Date();
  public mierDate = new Date();
  public jueDate = new Date();
  public vierDate = new Date();
  public sabdDate = new Date();
  public domDate = new Date();
  public cargando = false;
  public reservables: MesaDisponible[] = [];

  private endSubs = new Subscription();

  constructor(
    // private _liveAnnouncer: LiveAnnouncer,
    private tipoHabitacionSrvc: TipoHabitacionService,
    private mesaSrvc: MesaService,
    private reservaSrvc: ReservaService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.setDates();
    // this.dateChanged(moment().toDate());    
    this.setPaginatorAndSort();
  }

  ngAfterViewInit() {
    this.loadTiposHabitacion();
    this.loadReservables();
    // this.dateChanged(moment().toDate());
    this.setPaginatorAndSort();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadTiposHabitacion = () => {
    this.cargando = true;
    this.endSubs.add(
      this.tipoHabitacionSrvc.get().subscribe((res: TipoHabitacion[]) => {
        for (const tipHab of res) {
          this.roomArr.push({
            id: +tipHab.tipo_habitacion,
            long_status: 'DISPONIBLE',
            text: tipHab.descripcion,
            type: tipHab.icono,
            shouldFilter: true
          });
        }
        // console.log(this.roomArr);
        // this.fltrTipoHabitacion.dataSourceR = this.roomArr;
        // this.fltrTipoHabitacion.setdata();
        this.cargando = false;
      })
    );
  }

  loadReservables = () => {
    this.cargando = true;
    this.endSubs.add(
      this.mesaSrvc.getMesaFullData({ esreservable: 1 }).subscribe(res => {
        this.reservables = res;
        this.dateChanged(moment().toDate());
        this.cargando = false;
      })
    );
  }

  setPaginatorAndSort() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * This method Select Days to be displayed
   * According first day to nearest previous Monday
   */
  setDates(): void {

    //Nearest Monday Day
    const mondayDat = moment().day('Monday').toDate().getDay();
    const SelectedDay = this.sdate.getDay();
    if (mondayDat !== SelectedDay) {
      this.sdate.setDate(this.sdate.getDate() - (this.sdate.getDay() + 6) % 7);
    }

    this.monDate = moment(this.sdate).toDate();
    this.marDate = moment(this.sdate).add(1, 'd').toDate();
    this.mierDate = moment(this.sdate).add(2, 'd').toDate();
    this.jueDate = moment(this.sdate).add(3, 'd').toDate();
    this.vierDate = moment(this.sdate).add(4, 'd').toDate();
    this.sabdDate = moment(this.sdate).add(5, 'd').toDate();
    this.domDate = moment(this.sdate).add(6, 'd').toDate();
  }

  update(): void {
    this.dateChanged(moment().toDate());
  }

  addFiler(event: any) {
    console.log(event);
    // const obj = FakeBakend.RoomArrTypesFilter.filter((value, index, array) => {
    //   return value.type === event.type;
    // });
    // const indexFB = FakeBakend.RoomArrTypesFilter.indexOf(obj[0]);

    // FakeBakend.RoomArrTypesFilter[indexFB].shouldFilter = !event.shouldFilter;

    // this.dateChanged(this.sdate);
  }

  filterRoom(type): boolean {
    let result = false;
    // for (let a = 0; a < FakeBakend.RoomArrTypesFilter.length; a++) {
    //   if (FakeBakend.RoomArrTypesFilter[a].type.toString() === type) {
    //     result = FakeBakend.RoomArrTypesFilter[a].shouldFilter;
    //     break;
    //   }
    // }
    return result;
  }

  /**
   * Como es un mat table , este genera los datos para desplegarlos
   * en la tabla
   * @param event
   */
  async dateChanged(event) {
    // console.log('SELECCIONADA = ', event);
    // Se dates on headers of calendar
    this.sdate = moment(event).toDate();
    this.setDates();

    //Retrieve data to display
    this.dataSourceTemp = [];
    // console.log('LUNES = ', moment(this.monDate).format(GLOBAL.dbDateFormat));    
    const rsrvs = await this.reservaSrvc.get({ fecha: moment(this.monDate).format(GLOBAL.dbDateFormat) }).toPromise();
    // console.log(rsrvs);
    if (rsrvs.exito) {
      this.reservables.forEach((reservable, i) => {
        const obj: DayCalendar = this.procesaResevablesReservaciones(reservable, rsrvs.reservas);
        this.dataSourceTemp.push(obj);
      });

      // console.log('DataSource Temp ' + JSON.stringify(this.dataSourceTemp));
      this.dataSource = new MatTableDataSource<DayCalendar>(this.dataSourceTemp);
      // this.dataSource = JSON.parse(JSON.stringify(this.dataSourceTemp));
      // console.log('DataSource = ', this.dataSource.data);
      this.dataSourceTemp = null;
      // console.log('DataSource Temp ' + JSON.stringify(this.dataSourceTemp));
      this.setPaginatorAndSort();
      this.tblReservas.renderRows();
    } else {
      this.snackBar.open(rsrvs.mensaje, 'Reservas', { duration: 7000 })
    }
  }

  requestUpdate() {
    this.dateChanged(this.sdate);
  }

  procesaResevablesReservaciones = (reservable: MesaDisponible, dias: any): DayCalendar => {
    const resRes: DayCalendar = {
      habitacionName: reservable.etiqueta || reservable.numero.toString(),
      habitacion: reservable.tipo_habitacion ? (reservable.tipo_habitacion as TipoHabitacion)?.icono || 'home' : 'home',
      lunes: RevStat.DISPONIBLE,
      martes: RevStat.DISPONIBLE,
      miercoles: RevStat.DISPONIBLE,
      jueves: RevStat.DISPONIBLE,
      viernes: RevStat.DISPONIBLE,
      sabado: RevStat.DISPONIBLE,
      domingo: RevStat.DISPONIBLE,
      roomId: +reservable.mesa,
      resL: -1, resM: -1, resMi: -1, resJ: -1, resV: -1, resS: -1, resD: -1,
      roomIdType: reservable.tipo_habitacion ? +(reservable.tipo_habitacion as TipoHabitacion).tipo_habitacion : 1,
      idReservacion: null
    };

    let reservas: Reserva[] = [];
    for (const key in dias) {
      reservas = JSON.parse(JSON.stringify(dias[key]));
      if (reservas.length > 0) {
        for (const reserva of reservas) {
          if (+reserva.mesa === +resRes.roomId) {
            if (reserva.detalle.length > 0) {
              for (const det of reserva.detalle) {
                switch (true) {
                  case det.fecha === moment(this.monDate).format(GLOBAL.dbDateFormat):
                    resRes.lunes = reserva.descripcion_estatus_reserva;
                    // resRes.resL = 1;
                    resRes.resL = +reserva.reserva;
                    resRes.idReservacion = +reserva.reserva;
                    break;
                  case det.fecha === moment(this.marDate).format(GLOBAL.dbDateFormat):
                    resRes.martes = reserva.descripcion_estatus_reserva;
                    // resRes.resM = 1;
                    resRes.resM = +reserva.reserva;
                    resRes.idReservacion = +reserva.reserva;
                    break;
                  case det.fecha === moment(this.mierDate).format(GLOBAL.dbDateFormat):
                    resRes.miercoles = reserva.descripcion_estatus_reserva;
                    // resRes.resMi = 1;
                    resRes.resMi = +reserva.reserva;
                    resRes.idReservacion = +reserva.reserva;
                    break;
                  case det.fecha === moment(this.jueDate).format(GLOBAL.dbDateFormat):
                    resRes.jueves = reserva.descripcion_estatus_reserva;
                    // resRes.resJ = 1;
                    resRes.resJ = +reserva.reserva;
                    resRes.idReservacion = +reserva.reserva;
                    break;
                  case det.fecha === moment(this.vierDate).format(GLOBAL.dbDateFormat):
                    resRes.viernes = reserva.descripcion_estatus_reserva;
                    // resRes.resV = 1;
                    resRes.resV = +reserva.reserva;
                    resRes.idReservacion = +reserva.reserva;
                    break;
                  case det.fecha === moment(this.sabdDate).format(GLOBAL.dbDateFormat):
                    resRes.sabado = reserva.descripcion_estatus_reserva;
                    // resRes.resS = 1;
                    resRes.resS = +reserva.reserva;
                    resRes.idReservacion = +reserva.reserva;
                    break;
                  case det.fecha === moment(this.domDate).format(GLOBAL.dbDateFormat):
                    resRes.domingo = reserva.descripcion_estatus_reserva;
                    // resRes.resD = 1;
                    resRes.resD = +reserva.reserva;
                    resRes.idReservacion = +reserva.reserva;
                    break;
                }
              }
            }
          }
        }
      }
    }
    return resRes;
  }

}
