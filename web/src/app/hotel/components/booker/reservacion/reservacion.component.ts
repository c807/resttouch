import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {RevStat} from './RevStat';
import {MatDialog} from '@angular/material/dialog';
import {ReservationDialogComponent} from '../reservationd/reservation-dialog.component';
import {ReservationDialogcancelComponent} from '../reservationc/reservation-dialogcancel.component';
import {FakeBakend} from '../FakeBakend';


@Component({
  selector: 'app-reservacion',
  templateUrl: './reservacion.component.html',
  styleUrls: ['./reservacion.component.css'],
})

export class ReservacionComponent implements AfterViewInit {


  @Input() text: string;
  @Input() resId: string;
  @Input() roomId: number;
  @Output() requestUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Input() cDate: string;

  public isCanceled(): boolean {
    const obj = FakeBakend.RoomReservations.find(element => element.id.toString() === this.resId.toString());
    return obj.cancelado;
  }

  public Disponible(): boolean {
    return (this.text === RevStat.DISPONIBLE || this.isCanceled() === true );
  }

  public Reservada(): boolean {
    return (this.text === RevStat.RESERVADA && this.isCanceled() === false);
  }

  public Mantenimiento(): boolean {
    return (this.text === RevStat.MANTENIMIENTO  && this.isCanceled() === false );
  }

  public NoDisponible(): boolean {
    return (this.text === RevStat.NO_DISPONIBLE && this.isCanceled() === false );
  }

  shouldShowText(): boolean {
    return !(this.text === RevStat.DISPONIBLE);
  }

  constructor(public dialog: MatDialog) {

  }

  openDialog() {

    if (this.Disponible()) {
      this.showDisponible();
    } else if (this.Reservada()) {
      this.cancelReservation();
    } else if (this.Mantenimiento()) {
      this.cancelReservation();
    } else if (this.NoDisponible()) {
      this.cancelReservation();
    }

  }

  showDisponible() {
    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      height: '300px',
      width: '500px',
      data: {roomId: this.roomId, cDate: this.cDate},
    });
    dialogRef.afterClosed().subscribe(result => {
      this.requestUpdate.emit();
    });
  }

  cancelReservation() {
    const dialogRef = this.dialog.open(ReservationDialogcancelComponent, {
      height: '300px',
      width: '500px',
      data: {
        resId: this.resId,
        roomId: this.roomId,
        cDate: this.cDate
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      this.requestUpdate.emit();
    });
  }

  ngAfterViewInit(): void {
  }


}
