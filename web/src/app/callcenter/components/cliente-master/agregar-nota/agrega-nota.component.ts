import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ClienteMaster } from '@callcenter-interfaces/cliente-master';
import { ClienteMasterService } from '@callcenter-services/cliente-master.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agrega-nota',
  templateUrl: './agrega-nota.component.html',
  styleUrls: ['./agrega-nota.component.css']
})

export class AgregaNotaComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  public nombre: any = {};
  public nota: any = {};

  public isEditing = false;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<AgregaNotaComponent>,
    private clienteMasterSrvc: ClienteMasterService,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,    
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }


  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.isEditing = this.data.isEditing;
    if (this.data.defData) {
      this.nota = this.data.defData;
    }

    this.nombre = this.data.clienteMaster.nombre;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  cancelar = () => this.dialogRef.close();

  onNotaSubmit = () => {
    const obj = {
      cliente_master_nota: this.nota.cliente_master_nota,
      cliente_master: this.data.clienteMaster.cliente_master,
      nota: this.nota.nota,
      debaja: 0
    };

    this.endSubs.add(
      this.clienteMasterSrvc.saveNotaClienteMaster(obj).subscribe(res => {
        if (res.exito) {
          this.dialogRef.close();
          this.snackBar.open(res.mensaje, 'Nota asociada', { duration: 3000 });
        } else {
          console.log(`ERROR: ${res.mensaje}`, 'Error al agregar nota)');
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Error al agregar nota', { duration: 7000 });
        }
      })
    );
  }
}
