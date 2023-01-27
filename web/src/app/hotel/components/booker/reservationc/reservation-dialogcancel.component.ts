import {AfterViewInit, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RevStat} from '@hotel-components/booker/reservacion/RevStat';
import {FakeBakend} from '@hotel/components/booker/FakeBakend';
import * as moment from 'moment';

export interface DialogData {
  roomId: number;
  cDate: string;
  resId: string;
}

@Component({
  selector: 'app-reservation-dialogcancel',
  templateUrl: './reservation-dialogcancel.component.html',
  styleUrls: ['./reservation-dialogcancel.component.css'],
})
export class ReservationDialogcancelComponent implements AfterViewInit {
  currenD;
  fromRazon = '';
  resId = '';

  constructor(
    public dialogRef: MatDialogRef<ReservationDialogcancelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.currenD = moment(this.data.cDate).format('YYYY-MM-DD');
    this.resId = data.resId;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {

  }


  validatorsChanged() {
    console.log('Change date');
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


  public removeReservation(): void {
    //Get the number of days in range

    const obj = FakeBakend.RoomReservations.find(element => element.id.toString() === this.resId.toString());

    if (obj !== undefined || obj !== null) {
      const index = FakeBakend.RoomReservations.indexOf(obj);
      console.log(obj);
      FakeBakend.RoomReservations[index]['cancelado'] = true;
      FakeBakend.RoomReservations[index]['razon'] = this.fromRazon;
    }

    this.dialogRef.close();
  }
}
