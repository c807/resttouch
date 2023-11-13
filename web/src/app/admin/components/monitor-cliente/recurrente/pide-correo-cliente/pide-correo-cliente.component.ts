import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, isNotNullOrUndefined } from '@shared/global';

@Component({
  selector: 'app-pide-correo-cliente',
  templateUrl: './pide-correo-cliente.component.html',
  styleUrls: ['./pide-correo-cliente.component.css']
})
export class PideCorreoClienteComponent implements OnInit {

  public correo_cliente: string = null;

  constructor(
    public dialogRef: MatDialogRef<PideCorreoClienteComponent>,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  validarCorreo = () => {    
    if (isNotNullOrUndefined(this.correo_cliente) && this.correo_cliente.match(GLOBAL.FORMATO_EMAIL)) {
      this.dialogRef.close(this.correo_cliente);
    } else {
      this.snackBar.open('Debe ingresar un correo válido para continuar.', 'Cliente de recurrente.com', { duration: 5000 });
    }
  }

}
