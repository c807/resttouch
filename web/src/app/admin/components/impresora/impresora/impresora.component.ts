import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaImpresoraComponent } from '../lista-impresora/lista-impresora.component';
import { Impresora } from '../../../interfaces/impresora';

@Component({
  selector: 'app-impresora',
  templateUrl: './impresora.component.html',
  styleUrls: ['./impresora.component.css']
})
export class ImpresoraComponent implements OnInit {
  
  public impresora: Impresora;
  @ViewChild('lstImpresora', { static: false }) lstImpresoraComponent: ListaImpresoraComponent;

  constructor() {
  	this.impresora = {
  		impresora:null, nombre:null, direccion_ip: null, ubicacion:null, bluetooth:0, sede:null
  	};
  }

  ngOnInit() {
  }

  setImpresora = (cli: Impresora) => this.impresora = cli;

  refreshImpresoraList = () => this.lstImpresoraComponent.loadImpresoras();

}
