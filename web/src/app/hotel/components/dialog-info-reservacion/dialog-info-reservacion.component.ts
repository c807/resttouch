import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// import { Reserva } from '@hotel-interfaces/reserva';
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
export class DialogInfoReservacionComponent implements OnInit, OnDestroy {

  public reserva: any = {};
  
  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<DialogInfoReservacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private reservaSrvc: ReservaService
  ) { }

  ngOnInit(): void {
    this.loadInfoReserva();    
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadInfoReserva = () => this.endSubs.add(this.reservaSrvc.getInfoReserva(this.data.idReservacion).subscribe(res => this.reserva = res.reserva || {}));

}
