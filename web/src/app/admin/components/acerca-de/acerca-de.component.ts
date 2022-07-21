import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { LocalstorageService } from '../../services/localstorage.service';
import { GLOBAL } from '../../../shared/global';

@Component({
  selector: 'app-acerca-de',
  templateUrl: './acerca-de.component.html',
  styleUrls: ['./acerca-de.component.css']
})
export class AcercaDeComponent implements OnInit {

  public sedeUuid: string = null;
  public rtVersion: string = GLOBAL.rtVersion;
  public dominio: string = null;
  public restaurante: string = null;
  public cnfRoute: string = null;

  constructor(
    public dialogRef: MatDialogRef<AcercaDeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.sedeUuid = this.ls.get(GLOBAL.usrTokenVar).sede_uuid || 'No ha iniciado sesión.';
    this.dominio = this.ls.get(GLOBAL.usrTokenVar).dominio || 'No ha iniciado sesión.';
    const nombreRestaurante = `${this.ls.get(GLOBAL.usrTokenVar).restaurante?.nombre || ''} (${this.ls.get(GLOBAL.usrTokenVar).restaurante?.alias || ''})`;
    this.restaurante = nombreRestaurante || 'No ha iniciado sesión.';
    this.cnfRoute = this.ls.get(GLOBAL.usrTokenVar).cnf || 'No ha iniciado sesión.';
  }

  cerrar = () => this.dialogRef.close();

}
