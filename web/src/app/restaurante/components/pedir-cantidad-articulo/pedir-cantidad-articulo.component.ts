import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pedir-cantidad-articulo',
  templateUrl: './pedir-cantidad-articulo.component.html',
  styleUrls: ['./pedir-cantidad-articulo.component.css']
})
export class PedirCantidadArticuloComponent implements OnInit {

  public cantidadArticulos = 1;

  constructor(
    public dialogRef: MatDialogRef<PedirCantidadArticuloComponent>
  ) { }

  ngOnInit(): void {
  }

  terminar = () => this.dialogRef.close(this.cantidadArticulos);

}
