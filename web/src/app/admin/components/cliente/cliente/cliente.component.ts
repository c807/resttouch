import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaClienteComponent } from '../lista-cliente/lista-cliente.component';
import { Cliente } from '../../../interfaces/cliente';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {

  public cliente: Cliente;
  @ViewChild('lstCliente') lstClienteComponent: ListaClienteComponent;

  constructor() {
    this.cliente = { 
      cliente: null, nombre: null, direccion: null, nit: null, telefono: null, correo: null,
      codigo_postal: null, municipio: null, departamento: null, pais_iso_dos: null, tipo_cliente: null
    };
  }

  ngOnInit() {
  }

  setCliente = (cli: Cliente) => this.cliente = cli;

  refreshClienteList = () => this.lstClienteComponent.loadClientes();

}
