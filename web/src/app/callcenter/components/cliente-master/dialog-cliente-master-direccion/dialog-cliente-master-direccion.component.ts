import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ClienteMasterDireccion, ClienteMasterTelefono, ClienteMasterDireccionResponse } from '../../../interfaces/cliente-master';
import { ClienteMasterService } from '../../../services/cliente-master.service';

import { AgregaDireccionComponent } from '../../cliente-master/agrega-direccion/agrega-direccion.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-cliente-master-direccion',
  templateUrl: './dialog-cliente-master-direccion.component.html',
  styleUrls: ['./dialog-cliente-master-direccion.component.css']
})
export class DialogClienteMasterDireccionComponent implements OnInit, OnDestroy {

  public endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<DialogClienteMasterDireccionComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: ClienteMasterTelefono,
    public clienteMasterSrvc: ClienteMasterService
  ) { }

  ngOnInit(): void {
    // console.log(this.data);
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  terminar = (dirSel: ClienteMasterDireccionResponse = null) => this.dialogRef.close(dirSel);

  agregarDireccion = () => {
    const addDirRef = this.dialog.open(AgregaDireccionComponent, {
      maxWidth: '90vw', maxHeight: '75vh', width: '99vw', height: '85vh',
      disableClose: true,
      data: {
        clienteMaster: {
          cliente_master: this.data.cliente_master,
          nombre: this.data.nombre,
          correo: this.data.correo,
          fecha_nacimiento: this.data.fecha_nacimiento
        },
        isEditing: false,
        returnNewAddress: true
      }
    });

    this.endSubs.add(
      addDirRef.afterClosed().subscribe(async (result: ClienteMasterDireccion) => {
        if (result) {
          const newDir = await this.clienteMasterSrvc.buscarDireccion({ cliente_master_direccion: result.cliente_master_direccion }).toPromise();
          if (newDir && newDir.length > 0) {
            this.terminar(newDir[0]);
          }
        }
      })
    );
  }


}
