import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { HabType } from './habitacion/HabTypeE';
import { RevStat } from './reservacion/RevStat';
import { FakeBakend } from './FakeBakend';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ThemePalette } from '@angular/material/core';
import { FilterComponent } from '../booker/filtro/filter.component';

import { TipoHabitacion } from '../../../admin/interfaces/tipo-habitacion';
import { TipoHabitacionService } from '../../../admin/services/tipo-habitacion.service';
import { MesaDisponible } from '../../../restaurante/interfaces/mesa';
import { MesaService } from '../../../restaurante/services/mesa.service';

import { Subscription } from 'rxjs';

export interface DayCalendar {
  martes: RevStat;
  lunes: RevStat;
  miercoles: RevStat;
  jueves: RevStat;
  viernes: RevStat;
  sabado: RevStat;
  domingo: RevStat;
  habitacion: HabType;
  habitacionName: string;
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
})
export class BookerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
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

  private endSubs = new Subscription();

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private tipoHabitacionSrvc: TipoHabitacionService,
    private mesaSrvc: MesaService
  ) {
  }

  ngOnInit(): void {
    this.setDates();
    this.dateChanged(moment().toDate());
    this.setPaginatorAndSort();
  }

  ngAfterViewInit() {
    this.loadTiposHabitacion();
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
        this.fltrTipoHabitacion.dataSourceR = this.roomArr;
        this.fltrTipoHabitacion.setdata();
        this.cargando = false;
      })
    );
  }

  loadReservables = () => {
    this.cargando = true;
    this.endSubs.add(
      this.mesaSrvc.getMesaFullData({ esreservable: 1 }).subscribe(res => {

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
    for (let a = 0; a < FakeBakend.RoomArrTypesFilter.length; a++) {
      if (FakeBakend.RoomArrTypesFilter[a].type.toString() === type) {
        result = FakeBakend.RoomArrTypesFilter[a].shouldFilter;
        break;
      }
    }
    return result;
  }

  /**
   * Como es un mat table , este genera los datos para desplegarlos
   * en la tabla
   * @param event
   */
  dateChanged(event) {
    // Se dates on headers of calendar
    this.sdate = moment(event).toDate();
    this.setDates();

    //Retrieve data to display
    this.dataSourceTemp = [];
    FakeBakend.RoomArr.forEach((RomA, RomAindex) => {


      const shouldFilter = this.filterRoom(RomA.type);
      // console.log(shouldFilter);


      if (shouldFilter === false) {
        // Should filter the room
        return;
      }


      // Data to be manipulated and displayed on the table
      // This is a Row
      //resL , resM are the ids of the reservations on RoomReservations
      //lunes , martes are the types of the reservations wich corresponds to the icon
      //habitacion, Room Type , because its filtered by Room
      //Room Name,
      //roomId the rom Id wich cotains the reservations
      const obj = {
        habitacionName: RomA.text,
        habitacion: RomA.type,
        lunes: RevStat.DISPONIBLE,
        martes: RevStat.DISPONIBLE,
        miercoles: RevStat.DISPONIBLE,
        jueves: RevStat.DISPONIBLE,
        viernes: RevStat.DISPONIBLE,
        sabado: RevStat.DISPONIBLE,
        domingo: RevStat.DISPONIBLE,
        roomId: RomA.id,
        resL: -1, resM: -1, resMi: -1, resJ: -1, resV: -1, resS: -1, resD: -1
      };
      //Retrieve reservations For Room Here
      //Extrar las reservaciones por habitaciones
      const reservations = FakeBakend.RoomReservations;
      reservations.forEach((value, index) => {
        const date = moment(value.fecha, 'DD/MM/YYYY');
        const dow = date.day();

        //Si se va a agregar la hora , es aqui.
        const isInRange = date.isBetween(moment(this.monDate).subtract(1, 'days'), moment(this.domDate).add(1, 'days'));
        const currentRoom = (RomA.id === value.room_id);

        if (!isInRange || !currentRoom) {
          // The given date is not in rage of monday to sunday date
          // The rooms ids are not equal
          return;
        }
        // Set reservation Id


        // Set the day reserved according its position in the array
        switch (dow) {
          case 0:
            obj[this.reservationIdDays[7]] = value.id;
            obj[this.displayedColumns[7]] = value.type;
            break;
          default:

            obj[this.reservationIdDays[dow]] = value.id;
            obj[this.displayedColumns[dow]] = value.type;
            break;
        }

      });
      this.dataSourceTemp.push(obj);
    });

    // console.log('DataSource ' + JSON.stringify(this.dataSourceTemp));
    this.dataSource = new MatTableDataSource<DayCalendar>(this.dataSourceTemp);
    this.setPaginatorAndSort();
  }

  requestUpdate() {
    this.dateChanged(this.sdate);
  }

  /** Announce the change in sort state for assistive technology. */


}
