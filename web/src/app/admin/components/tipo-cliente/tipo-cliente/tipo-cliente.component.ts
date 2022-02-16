import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTipoClienteComponent } from '../lista-tipo-cliente/lista-tipo-cliente.component';
import { TipoCliente } from '../../../interfaces/tipo-cliente';

@Component({
  selector: 'app-tipo-cliente',
  templateUrl: './tipo-cliente.component.html',
  styleUrls: ['./tipo-cliente.component.css']
})
export class TipoClienteComponent implements OnInit {
  
  public tipoCliente: TipoCliente;
  @ViewChild('lstTipoCliente') lstTipoCliente: ListaTipoClienteComponent;

  constructor() {
    this.tipoCliente = { tipo_cliente: null, descripcion: null };
  }

  ngOnInit(): void {
  }

  setTipoCliente = (tc: TipoCliente) => this.tipoCliente = tc;

  refreshTipoClienteList = () => this.lstTipoCliente.loadTiposCliente();  

}
