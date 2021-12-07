import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GLOBAL } from '../../../shared/global';
import { LocalstorageService } from '../../../admin/services/localstorage.service';

interface IDatosNotas {
  titulo: string;
  notasGenerales: string;
}

@Component({
  selector: 'app-notas-generales-comanda',
  templateUrl: './notas-generales-comanda.component.html',
  styleUrls: ['./notas-generales-comanda.component.css']
})
export class NotasGeneralesComandaComponent implements OnInit {

  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    public dialogRef: MatDialogRef<NotasGeneralesComandaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDatosNotas,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  terminar = (obj: string = null) => this.dialogRef.close(obj);

}
