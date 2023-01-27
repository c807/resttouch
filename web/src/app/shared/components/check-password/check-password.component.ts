import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ComandaService } from '@restaurante-services/comanda.service';

import { Subscription } from 'rxjs';

export class ConfigCheckPasswordModel {
  constructor(
    public tipo: number,
    public subtitulo?: string,
    public etiquetaAceptar?: string
  ) { }
}

@Component({
  selector: 'app-check-password',
  templateUrl: './check-password.component.html',
  styleUrls: ['./check-password.component.css']
})
export class CheckPasswordComponent implements OnInit, OnDestroy {

  public pwd: string = undefined;

  private endSubs = new Subscription();

  constructor(
    private comandaSrvc: ComandaService,
    public dialogRef: MatDialogRef<CheckPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfigCheckPasswordModel
  ) { }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  cancelar = () => this.dialogRef.close();

  terminar = () => {
    switch (+this.data.tipo) {
      case 1: this.validarPwdGerenteTurno(); break;
    }
  }

  validarPwdGerenteTurno = () => {
    this.endSubs.add(
      this.comandaSrvc.validaPwdGerenteTurno(this.pwd).subscribe(res => {
        if (res.exito) {
          this.dialogRef.close(res.esgerente);
        } else {
          this.dialogRef.close(false);
        }
      })
    );
  }

}
