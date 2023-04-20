import { Component, OnInit, OnDestroy, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

import { ReservaService } from '@hotel-services/reserva.service';

import { Subscription } from 'rxjs';

export interface DialogData {
  idReservacion: number;
}

@Component({
  selector: 'app-dialog-info-reservacion',
  templateUrl: './dialog-info-reservacion.component.html',
  styleUrls: ['./dialog-info-reservacion.component.css']
})
export class DialogInfoReservacionComponent implements OnInit, OnDestroy, AfterViewInit {

  get cantidadNoches(): number {
    let noches: number = null;

    if (moment(this.reserva.fecha_del).isValid && moment(this.reserva.fecha_al).isValid()) {
      if (moment(this.reserva.fecha_al).isAfter(moment(this.reserva.fecha_del))) {
        noches = moment(this.reserva.fecha_al).diff(moment(this.reserva.fecha_del), 'days') + 1;
        if (noches === 0) {
          noches = 1;
        }
      } else if (moment(this.reserva.fecha_al).isSame(moment(this.reserva.fecha_del))) {
        noches = 1;
      }
    }

    return noches;
  }

  public reserva: any = {};
  
  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<DialogInfoReservacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private reservaSrvc: ReservaService
  ) { }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
    this.loadInfoReserva();    
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadInfoReserva = () => this.endSubs.add(this.reservaSrvc.getInfoReserva(this.data.idReservacion).subscribe(res => this.reserva = res.reserva || {}));

}
