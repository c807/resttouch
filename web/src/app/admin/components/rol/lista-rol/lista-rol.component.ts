import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Rol } from '@admin-interfaces/rol';
import { RolService } from '@admin-services/rol.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-rol',
  templateUrl: './lista-rol.component.html',
  styleUrls: ['./lista-rol.component.css']
})
export class ListaRolComponent implements OnInit, OnDestroy {

  public lstRoles: Rol[];
  public lstRolesPaged: Rol[];
  @Output() getRolEv = new EventEmitter();
  @ViewChild('paginador') paginador: MatPaginator;

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
    private rolSrvc: RolService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstRoles, this.txtFiltro);
      this.length = tmpList.length;
      this.lstRolesPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstRoles.length;
      this.lstRolesPaged = PaginarArray(this.lstRoles, this.pageSize, this.pageIndex + 1);
    }
    if (!cambioPagina) {
      this.paginador.firstPage();
    }
  }

  loadRoles = () => {
    this.endSubs.add(
      this.rolSrvc.get().subscribe(lst => {
        if (lst) {
          if (lst.length > 0) {
            this.lstRoles = lst;
            this.applyFilter();
          }
        }
      })
    );
  }

  getRol = (obj: Rol) => {
    this.getRolEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter(true);
  }

}
