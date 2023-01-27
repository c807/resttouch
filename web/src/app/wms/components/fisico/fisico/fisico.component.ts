import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { FormInventarioFisicoComponent } from '@wms-components/fisico/form-inventario-fisico/form-inventario-fisico.component'
import { ReporteComponent } from '@wms-components/fisico/reporte/reporte.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fisico',
  templateUrl: './fisico.component.html',
  styleUrls: ['./fisico.component.css']
})
export class FisicoComponent implements OnInit, OnDestroy {

  @ViewChild('rptInventario') rptInventarioComponent: ReporteComponent;
  @ViewChild('frmInventario') frmInventarioComponent: FormInventarioFisicoComponent;
  public esCuadreDiario = false;

  private endSubs = new Subscription();

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.endSubs.add(
      this.route.url.subscribe((url: UrlSegment[]) => {
        if (url[0].path === 'cuadre_diario') {          
          this.esCuadreDiario = true;
        }
      })
    );    
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

}
