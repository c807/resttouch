import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ClienteMasterTelefono, ClienteMasterCliente } from '@callcenter-interfaces/cliente-master';

import { DialogAgregarDatoDeFacturacionComponent } from '@callcenter-components/cliente-master/dialog-agregar-dato-de-facturacion/dialog-agregar-dato-de-facturacion.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-cliente-master-cliente',
  templateUrl: './dialog-cliente-master-cliente.component.html',
  styleUrls: ['./dialog-cliente-master-cliente.component.css']
})
export class DialogClienteMasterClienteComponent implements OnInit, OnDestroy {

  public endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<DialogClienteMasterClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClienteMasterTelefono,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  terminar = (datosFactSel: ClienteMasterCliente = null) => this.dialogRef.close(datosFactSel);

  agregarDatosFacturacion = () => {
    const selectDirRef = this.dialog.open(DialogAgregarDatoDeFacturacionComponent, {
      width: '75vw',
      disableClose: true,
      data: {
        cliente_master: this.data.cliente_master,
        nombre: this.data.nombre,
        correo: this.data.correo,
        fecha_nacimiento: this.data.fecha_nacimiento
      }
    });

    this.endSubs.add(
      selectDirRef.afterClosed().subscribe((res: ClienteMasterCliente) => {        
        this.terminar(res);
      })
    );    

  }
}
