import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';
import { ListaEgresoComponent } from '../lista-egreso/lista-egreso.component';
import { FormEgresoComponent } from '../form-egreso/form-egreso.component';
import { Egreso } from '../../../interfaces/egreso';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-egreso',
  templateUrl: './egreso.component.html',
  styleUrls: ['./egreso.component.css']
})
export class EgresoComponent implements OnInit, AfterViewInit {

  public egreso: Egreso;
  @ViewChild('lstEgreso') lstEgresoComponent: ListaEgresoComponent;
  @ViewChild('frmEgreso') frmEgreso: FormEgresoComponent;
  public esRequisicion = false;

  private endSubs = new Subscription();

  constructor(
    private ls: LocalstorageService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.egreso = {
      egreso: null, tipo_movimiento: null, bodega: null, fecha: moment().format(GLOBAL.dbDateFormat),
      usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), estatus_movimiento: 1, traslado: 0
    };
  }

  ngOnInit() {
    this.endSubs.add(
      this.route.url.subscribe((url: UrlSegment[]) => {
        if (url[0].path === 'requisiciones') {          
          this.esRequisicion = true;
        }
      })
    );    
  }

  ngAfterViewInit(): void {
    this.lstEgresoComponent.esRequisicion = this.esRequisicion;
    this.lstEgresoComponent.loadEgresos();
    this.frmEgreso.esRequisicion = this.esRequisicion;    
    this.frmEgreso.loadTiposMovimiento();
    this.cd.detectChanges();
  }

  setEgreso = (egr: Egreso) => {        
    this.frmEgreso.egreso = egr;
    this.frmEgreso.loadArticulos();
    this.frmEgreso.resetDetalleEgreso();
    this.frmEgreso.loadDetalleEgreso(+this.egreso.egreso);
  }

  refreshEgresoList = () => {
    this.lstEgresoComponent.loadEgresos();
  }

}
