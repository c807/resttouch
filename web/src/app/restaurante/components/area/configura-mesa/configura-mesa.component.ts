import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Mesa } from '@restaurante-interfaces/mesa';
import { Impresora } from '@admin-interfaces/impresora';
import { TipoHabitacion } from '@hotel-interfaces/tipo-habitacion';

import { MesaService } from '@restaurante-services/mesa.service';
import { ImpresoraService } from '@admin-services/impresora.service';
import { TipoHabitacionService } from '@hotel-services/tipo-habitacion.service';

import { Subscription } from 'rxjs';

interface IData {
  mesa: Mesa;
}

@Component({
  selector: 'app-configura-mesa',
  templateUrl: './configura-mesa.component.html',
  styleUrls: ['./configura-mesa.component.css']
})
export class ConfiguraMesaComponent implements OnInit, OnDestroy {

  public impresoras: Impresora[] = [];
  public mesa: any = {};
  public tiposHabitacion: TipoHabitacion[] = [];
  private endSubs = new Subscription();

  constructor(
    private mesaSrvc: MesaService,
    private impresoraSrvc: ImpresoraService,
    private snackBar: MatSnackBar,
    private tipoHabitacionSrvc: TipoHabitacionService,
    public dialogRef: MatDialogRef<ConfiguraMesaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IData
  ) { }

  ngOnInit() {
    this.mesa = this.data.mesa;
    this.loadImpresoras();
    this.loadTiposHabitacion();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();    
  }

  loadImpresoras = () => this.endSubs.add(this.impresoraSrvc.get().subscribe(res => this.impresoras = res));

  loadTiposHabitacion = () => {
    if(+this.mesa.eshabitacion === 1) {
      this.endSubs.add(
        this.tipoHabitacionSrvc.get().subscribe(res => this.tiposHabitacion = res)
      );
    }
  }

  cancelar = () => this.dialogRef.close(false);

  guardarConfiguracion = () => {
    this.endSubs.add(      
      this.mesaSrvc.save(this.mesa).subscribe(res => {
        if (res.exito) {
          if (!!res.mesa) {
            this.snackBar.open(`${+res.mesa.eshabitacion === 0 ? 'Mesa' : 'Habitación'} #${res.mesa.numero} actualizada...`, 'Configuración de mesa/habitación', { duration: 3000 });
          } else {
            this.snackBar.open(`${+this.mesa.eshabitacion === 0 ? 'Mesa' : 'Habitación'} #${this.mesa.numero} actualizada...`, 'Configuración de mesa/habitación', { duration: 3000 });
          }
        } else {
          this.snackBar.open(`ERROR:${res.mensaje}.`, 'Configuración de mesa/habitación', { duration: 7000 });
        }
        this.dialogRef.close(true);
      })
    );
  }
}
