import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { MesaService } from '@restaurante-services/mesa.service';
import { MesaDisponible } from '@restaurante-interfaces/mesa';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-select-reservable',
  templateUrl: './dialog-select-reservable.component.html',
  styleUrls: ['./dialog-select-reservable.component.css']
})
export class DialogSelectReservableComponent implements OnInit {

  public habitacionSelected: MesaDisponible;
  public cargando = false;
  public reservables: MesaDisponible[] = [];

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<DialogSelectReservableComponent>,
    private mesaSrvc: MesaService
  ) { }

  ngOnInit(): void {
    this.habitacionSelected = {
      mesa: null, area: null, numero: null, posx: null, posy: null, tamanio: null, estatus: null      
    }
    this.loadReservables();
  }

  loadReservables = () => {
    this.cargando = true;
    this.endSubs.add(
      this.mesaSrvc.getMesaFullData({ esreservable: 1, estatus: 1 }).subscribe(res => {
        this.reservables = res;        
        this.cargando = false;
      })
    );
  }

  cerrar = (idHabitacion: number) => this.dialogRef.close(+idHabitacion);
}
