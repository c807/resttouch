import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';

import { TipoHabitacion } from '../../../interfaces/tipo-habitacion';
import { TipoHabitacionService } from '../../../services/tipo-habitacion.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-tipo-habitacion',
  templateUrl: './lista-tipo-habitacion.component.html',
  styleUrls: ['./lista-tipo-habitacion.component.css']
})
export class ListaTipoHabitacionComponent implements OnInit, OnDestroy {

  public lstTiposHabitacion: TipoHabitacion[];
  public lstTiposHabitacionPaged: TipoHabitacion[];
  @Output() getTipoHabitacionEv = new EventEmitter();

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
    private tipoCompraVentaSrvc: TipoHabitacionService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiposHabitacion();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.lstTiposHabitacion, this.txtFiltro);
      this.length = tmpList.length;
      this.lstTiposHabitacionPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
    } else {
      this.length = this.lstTiposHabitacion.length;
      this.lstTiposHabitacionPaged = PaginarArray(this.lstTiposHabitacion, this.pageSize, this.pageIndex + 1);
    }
  }

  loadTiposHabitacion = () => {
    this.endSubs.add(
      this.tipoCompraVentaSrvc.get().subscribe(lst => {
        this.lstTiposHabitacion = lst;
        this.applyFilter();
      })
    );
  }

  getTipoHabitacion = (obj: TipoHabitacion) => {
    this.getTipoHabitacionEv.emit(obj);
  }

  pageChange = (e: PageEvent) => {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.applyFilter();
  }

}