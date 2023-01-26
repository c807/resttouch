import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { NotificacionCliente } from '@admin-interfaces/notificacion-cliente';

@Component({
  selector: 'app-notificaciones-cliente',
  templateUrl: './notificaciones-cliente.component.html',
  styleUrls: ['./notificaciones-cliente.component.css']
})
export class NotificacionesClienteComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<NotificacionesClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotificacionCliente[]
  ) { }

  ngOnInit(): void {
  }

  cerrar = () => this.dialogRef.close();

  actualizar = () => {
    console.log('tratando de actualizar...');    
  }
}
