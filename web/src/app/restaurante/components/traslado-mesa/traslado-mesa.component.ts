import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from 'src/app/shared/global';
import { LocalstorageService } from '../../../admin/services/localstorage.service';

import { MesaDisponible } from '../../interfaces/mesa';

import { MesaService } from '../../services/mesa.service';
import { ComandaService } from '../../services/comanda.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-traslado-mesa',
  templateUrl: './traslado-mesa.component.html',
  styleUrls: ['./traslado-mesa.component.css']
})
export class TrasladoMesaComponent implements OnInit, OnDestroy {

  public mesasDisponibles: MesaDisponible[] = [];
  public destino: MesaDisponible;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<TrasladoMesaComponent>,
    private snackBar: MatSnackBar,
    private mesaSrvc: MesaService,
    private comandaSrvc: ComandaService,
    private ls: LocalstorageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {   
    this.loadMesasDisponibles();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadMesasDisponibles = () => {
    const fltr = { solo_disponibles: 0 };

    if (this.data.solo_disponibles) {
      fltr.solo_disponibles = +this.data.solo_disponibles;
    } else {
      delete fltr.solo_disponibles;
    }

    this.endSubs.add(
      this.mesaSrvc.getDisponibles(fltr).subscribe((res: MesaDisponible[]) => this.mesasDisponibles = res)
    );
  };

  cancelar = () => this.dialogRef.close(false);

  trasladar = () => {

    const params = {
      razon_anulacion: null,
      usuario: null      
    };

    if (this.data.razon_anulacion) {
      params.razon_anulacion = this.data.razon_anulacion;
      params.usuario = this.ls.get(GLOBAL.usrTokenVar).idusr;
    } else {
      delete params.razon_anulacion;
      delete params.usuario;
    }

    this.endSubs.add(
      this.comandaSrvc.trasladarMesa(+this.data.mesaEnUso.comanda, +this.data.mesaEnUso.mesa.mesa, +this.destino.mesa, params).subscribe(res => {
        if (res.exito) {
          this.snackBar.open(res.mensaje, 'Traslado de mesa', { duration: 3000 });
          this.dialogRef.close(true);
        } else {
          this.snackBar.open(`ERROR:${res.mensaje}`, 'Traslado de mesa', { duration: 7000 });
        }
      })
    );
  }

}
