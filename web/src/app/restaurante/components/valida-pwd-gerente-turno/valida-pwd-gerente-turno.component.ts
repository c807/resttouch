import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GLOBAL } from '../../../shared/global';
import { LocalstorageService } from '../../../admin/services/localstorage.service';

import { ComandaService } from '../../services/comanda.service';

@Component({
  selector: 'app-valida-pwd-gerente-turno',
  templateUrl: './valida-pwd-gerente-turno.component.html',
  styleUrls: ['./valida-pwd-gerente-turno.component.css']
})
export class ValidaPwdGerenteTurnoComponent implements OnInit {

  public data: any = { pwd: undefined };
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    public dialogRef: MatDialogRef<ValidaPwdGerenteTurnoComponent>,
    private comandaSrvc: ComandaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  cancelar = () => this.dialogRef.close();

  terminar = () => {
    this.comandaSrvc.validaPwdGerenteTurno(this.data.pwd).subscribe(res => {
      // console.log(res);
      if (res.exito) {
        this.dialogRef.close({esgerente: res.esgerente, gerente_turno: res.gerente_turno});
      } else {
        this.dialogRef.close(false);
      }
    });
  }
}
