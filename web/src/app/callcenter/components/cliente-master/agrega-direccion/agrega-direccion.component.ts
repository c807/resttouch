import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { ClienteMaster, ClienteMasterDireccion, ClienteMasterDireccionResponse } from '../../../interfaces/cliente-master';
import { ClienteMasterService } from '../../../services/cliente-master.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agrega-direccion',
  templateUrl: './agrega-direccion.component.html',
  styleUrls: ['./agrega-direccion.component.css']
})

export class AgregaDireccionComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<AgregaDireccionComponent>,
    private clienteMasterSrvc: ClienteMasterService,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }
  cancelar = () => this.dialogRef.close();

  guardar = () => {

  }
}
