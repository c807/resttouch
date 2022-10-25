import {AfterViewInit, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {FormControl, FormGroup} from '@angular/forms';
import {RevStat} from '../reservacion/RevStat';
import * as moment from 'moment';
import {FakeBakend} from '../FakeBakend';

export interface DialogData {
  roomId: number;
  cDate: string;
}

@Component({
  selector: 'app-reservation-dialog',
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.css'],
})
export class ReservationDialogComponent implements AfterViewInit {
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  disableSelect = new FormControl(false);
  reservationTypes = [
    {id: 0, name: RevStat.MANTENIMIENTO},
    {id: 1, name: RevStat.NO_DISPONIBLE},
    {id: 2, name: RevStat.RESERVADA},
    {id: 3, name: RevStat.DISPONIBLE}
  ];
  selectedResType = this.reservationTypes[0];

  constructor(
    public dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {
    this.range = new FormGroup({
      start: new FormControl(moment(this.data.cDate).toDate()),
      end: new FormControl(),
    });
  }


  validatorsChanged() {
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

    const b = moment(this.range.value.start);
    const a = moment(this.range.value.end);
    const nu = Math.abs(a.diff(b, 'days') + 1);   // =1


    for (let i = 0; i < nu; i++) {
      const abj = {
        id: FakeBakend.RoomReservations.length + 1,
        fecha: moment(this.range.value.start).add(i, 'd').format('DD/MM/YYYY'),
        room_id: this.data.roomId,
        cancelado: false,
        razon: '',
        type: this.selectedResType.name,
      };
      FakeBakend.RoomReservations.push(abj);
    }

    this.dialogRef.close();
  }
}
