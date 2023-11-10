import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { NotificacionCliente, ClienteRT } from '@admin-interfaces/notificacion-cliente';
import { NotificacionClienteService } from '@admin-services/notificacion-cliente.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-notificacion-cliente',
  templateUrl: './form-notificacion-cliente.component.html',
  styleUrls: ['./form-notificacion-cliente.component.css']
})
export class FormNotificacionClienteComponent implements OnInit, OnDestroy {

  @Input() notificacionCliente: NotificacionCliente;
  @Output() notificacionClienteSavedEv = new EventEmitter();
  public listaClientes: ClienteRT[] = [];
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public nivelesIntensidad = [
    {nivel: '1', descripcion: 'Soft'},    
    {nivel: '2', descripcion: 'Hard'},
  ];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private notificacionClienteSrvc: NotificacionClienteService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.loadListaClientes();
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetNotificacionCliente();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadListaClientes = () => {
    this.endSubs.add(
      this.notificacionClienteSrvc.getListaClientes().subscribe(lst => this.listaClientes = lst)
    );
  }

  resetNotificacionCliente = () => this.notificacionCliente = { notificacion_cliente: null, asunto: null, notificacion: null, mostrar_del: null, mostrar_al: null, prioridad: 1, cliente_corporacion: null, intensidad: null };

  onSubmit = () => {
    this.endSubs.add(
      this.notificacionClienteSrvc.save(this.notificacionCliente).subscribe(res => {
        if (res.exito) {
          this.notificacionClienteSavedEv.emit();
          this.resetNotificacionCliente();
          this.snackBar.open('Notificación de cliente guardada...', 'Notificación de Cliente', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Notificación de Cliente', { duration: 7000 });
        }
      })
    );
  }

}
