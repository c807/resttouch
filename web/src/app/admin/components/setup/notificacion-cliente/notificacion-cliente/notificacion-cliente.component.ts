import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaNotificacionClienteComponent } from '@admin-components/setup/notificacion-cliente/lista-notificacion-cliente/lista-notificacion-cliente.component';
import { FormNotificacionClienteComponent } from '@admin-components/setup/notificacion-cliente/form-notificacion-cliente/form-notificacion-cliente.component';
import { NotificacionCliente } from '@admin-interfaces/notificacion-cliente';

@Component({
  selector: 'app-notificacion-cliente',
  templateUrl: './notificacion-cliente.component.html',
  styleUrls: ['./notificacion-cliente.component.css']
})
export class NotificacionClienteComponent implements OnInit {

  public notifCliente: NotificacionCliente;
  @ViewChild('lstNotificacionCliente') lstNotificacionCliente: ListaNotificacionClienteComponent;
  @ViewChild('frmNotificacionCliente') frmNotificacionCliente: FormNotificacionClienteComponent;

  constructor() {
    this.notifCliente = {
      notificacion_cliente: null, asunto: null, notificacion: null, mostrar_del: null, mostrar_al: null, prioridad: 1, cliente_corporacion: null
    };
  }

  ngOnInit(): void { }

  setNotificacionCliente = (nCli: NotificacionCliente) => {
    this.frmNotificacionCliente.resetNotificacionCliente();
    this.notifCliente = nCli;
    this.frmNotificacionCliente.notificacionCliente = { ...this.notifCliente };
  };

  refreshNotificacionClienteList = () => this.lstNotificacionCliente.loadNotificacionCliente();

}
