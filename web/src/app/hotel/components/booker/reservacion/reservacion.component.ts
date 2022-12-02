import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { RevStat } from './RevStat';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationDialogComponent } from '../reservationd/reservation-dialog.component';
import { ReservationDialogcancelComponent } from '../reservationc/reservation-dialogcancel.component';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';
// import { FakeBakend } from '../FakeBakend';


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
  @Input() roomIdType: number;
  @Input() idReservacion: number = null;
  @Input() debaja: number = 0;

  public isCanceled(): boolean {
    // const obj = FakeBakend.RoomReservations.find(element => element.id.toString() === this.resId.toString());
    // return obj.cancelado;
    return false
  }

  public Disponible(): boolean {
    return (this.text === RevStat.DISPONIBLE || this.isCanceled() === true);
  }

  public Reservada(): boolean {
    return (this.text === RevStat.RESERVADA && this.isCanceled() === false);
  }

  public CheckIn(): boolean {
    return (this.text === RevStat.CHECK_IN && this.isCanceled() === false);
  }

  public CheckOut(): boolean {
    return (this.text === RevStat.CHECK_OUT && this.isCanceled() === false);
  }

  public Mantenimiento(): boolean {
    return (this.text === RevStat.MANTENIMIENTO && this.isCanceled() === false);
  }

  public NoDisponible(): boolean {
    return (this.text === RevStat.NO_DISPONIBLE && this.isCanceled() === false);
  }

  shouldShowText(): boolean {
    return !(this.text === RevStat.DISPONIBLE);
  }

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  openDialog() {

    if (this.Disponible()) {
      this.showDisponible();
    } else if (this.Reservada() || this.CheckIn()) {
      this.showDisponible(+this.resId);
    } else if (this.Mantenimiento()) {
      this.cancelReservation();
    } else if (this.NoDisponible()) {
      this.cancelReservation();
    }

  }

  showDisponible(reservacionId: number = null) {
    if (+this.debaja === 0 || (+this.debaja === 1 && +reservacionId > 0)) {
      const hoy = moment(`${moment().format(GLOBAL.dbDateFormat)} 00:00:00`);
      const fselected = moment(`${moment(this.cDate).format(GLOBAL.dbDateFormat)} 00:00:00`);
  
      if (fselected.isBefore(hoy) && (reservacionId === null || reservacionId === undefined)) {
        this.snackBar.open('No puede hacer reservas con fechas pasadas.', 'Reserva', { duration: 7000 });
      } else {
        const dialogRef = this.dialog.open(ReservationDialogComponent, {
          width: '75%',
          data: { roomId: this.roomId, cDate: this.cDate, roomIdType: this.roomIdType, idReservacion: reservacionId },
        });
  
        dialogRef.afterClosed().toPromise().then(() => this.requestUpdate.emit());
      }
    } else {
      this.snackBar.open('La habitación fue dada de baja, no puede reservar en esta habitación.', 'Reserva', { duration: 7000 });      
    }
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

    dialogRef.afterClosed().toPromise().then(() => this.requestUpdate.emit());
  }

  ngAfterViewInit(): void {
  }


}
