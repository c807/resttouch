import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {GLOBAL} from '../../../shared/global';
import {LocalstorageService} from '../../../admin/services/localstorage.service';

import {ComandaService} from '../../services/comanda.service';

interface IDatosPWD {
  botonMensaje: string;
}

@Component({
  selector: 'app-valida-pwd-gerente-turno',
  templateUrl: './valida-pwd-gerente-turno.component.html',
  styleUrls: ['./valida-pwd-gerente-turno.component.css']
})
export class ValidaPwdGerenteTurnoComponent implements OnInit {

  public dataE: any = {pwd: undefined};
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public MensajeBoton = 'Eliminar producto';

  constructor(
    public dialogRef: MatDialogRef<ValidaPwdGerenteTurnoComponent>,
    private comandaSrvc: ComandaService,
    private ls: LocalstorageService,
    @Inject(MAT_DIALOG_DATA) public data: IDatosPWD,
  ) {
    if (this.data.botonMensaje) {
      this.MensajeBoton = this.data.botonMensaje;
    }
  }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  cancelar = () => this.dialogRef.close();

  terminar = () => {
    this.comandaSrvc.validaPwdGerenteTurno(this.dataE.pwd).subscribe(res => {
      if (res.exito) {
        this.dialogRef.close({esgerente: res.esgerente, gerente_turno: res.gerente_turno});
      } else {
        this.dialogRef.close(false);
      }
    });
  }
}
