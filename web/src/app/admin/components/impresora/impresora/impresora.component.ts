import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaImpresoraComponent } from '@admin-components/impresora/lista-impresora/lista-impresora.component';
import { Impresora } from '@admin-interfaces/impresora';

@Component({
  selector: 'app-impresora',
  templateUrl: './impresora.component.html',
  styleUrls: ['./impresora.component.css']
})
export class ImpresoraComponent implements OnInit {

  public impresora: Impresora;
  @ViewChild('lstImpresora') lstImpresoraComponent: ListaImpresoraComponent;

  constructor() {
    this.impresora = {
      impresora: null, nombre: null, direccion_ip: null, ubicacion: null, bluetooth: 0, sede: null, pordefecto: 0, pordefectocuenta: 0, pordefectofactura: 0
    };
  }

  ngOnInit() {
  }

  setImpresora = (cli: Impresora) => this.impresora = cli;

  refreshImpresoraList = () => this.lstImpresoraComponent.loadImpresoras();

}
