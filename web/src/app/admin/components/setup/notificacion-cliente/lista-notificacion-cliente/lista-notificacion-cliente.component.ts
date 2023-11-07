import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { NotificacionCliente } from '@admin-interfaces/notificacion-cliente';
import { NotificacionClienteService } from '@admin-services/notificacion-cliente.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-notificacion-cliente',
  templateUrl: './lista-notificacion-cliente.component.html',
  styleUrls: ['./lista-notificacion-cliente.component.css']
})
export class ListaNotificacionClienteComponent implements OnInit, OnDestroy {

  public lstNotificacionCliente: NotificacionCliente[];
  public lstNotificacionClientePaged: NotificacionCliente[];
  @Output() getNotificacionClienteEv = new EventEmitter();

  public length = 0;
  public pageSize = 5;
  public pageSizeOptions: number[] = [5, 10, 15];
  public pageIndex = 0;
  public pageEvent: PageEvent;
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private notificacionClienteSrvc: NotificacionClienteService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadNotificacionCliente();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstNotificacionCliente, this.txtFiltro);
      this.length = tmpList.length;
      this.lstNotificacionClientePaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstNotificacionCliente.length;
      this.lstNotificacionClientePaged = PaginarArray(this.lstNotificacionCliente, this.pageSize, this.pageIndex + 1);
    }
  }

  loadNotificacionCliente = () => {
    this.endSubs.add(
      this.notificacionClienteSrvc.getLista().subscribe(lst => {
        this.lstNotificacionCliente = lst;
        this.applyFilter();
      })
    );
  }

  getNotificacionCliente = (obj: NotificacionCliente) => {
    this.getNotificacionClienteEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }

}
