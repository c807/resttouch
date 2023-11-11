import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ClienteRT } from '@admin-interfaces/notificacion-cliente';
import { NotificacionClienteService } from '@admin-services/notificacion-cliente.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recurrente',
  templateUrl: './recurrente.component.html',
  styleUrls: ['./recurrente.component.css']
})
export class RecurrenteComponent implements OnInit, OnDestroy {

  public listaClientes: ClienteRT[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private notificacionClienteSrvc: NotificacionClienteService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.loadListaClientes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadListaClientes = () => {
    this.endSubs.add(
      this.notificacionClienteSrvc.getListaClientes().subscribe(lst => this.listaClientes = lst)
    );
  }

  generarIdClienteRecurrente = () => {
    
  }

}
