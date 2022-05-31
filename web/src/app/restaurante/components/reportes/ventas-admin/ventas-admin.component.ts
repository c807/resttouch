import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';

import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { AccesoUsuarioService } from '../../../../admin/services/acceso-usuario.service';
import { ReportePdfService } from '../../../services/reporte-pdf.service';

import { UsuarioSede } from '../../../../admin/interfaces/acceso';

import { saveAs } from 'file-saver';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ventas-admin',
  templateUrl: './ventas-admin.component.html',
  styleUrls: ['./ventas-admin.component.css']
})
export class VentasAdminComponent implements OnInit, OnDestroy {

  get configBotones() {
    const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid();
    return {
      showPdf: false, showHtml: false, showExcel: true,
      isPdfDisabled: true,
      isExcelDisabled: deshabilitar
    }
  };

  public params: any = {};
  public cargando = false;
  public sedes: UsuarioSede[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private sedeSrvc: AccesoUsuarioService,
    private ls: LocalstorageService,
    private rptVentasSrvc: ReportePdfService,
  ) { }

  ngOnInit(): void {
    this.resetParams();
    this.loadSedes();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.getSedes({ reporte: true }).subscribe(res => this.sedes = res)
    );
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
      sede: null
    };
    this.cargando = false;
  }

  getVentasAdmin = () => {
    this.cargando = true;    
    this.endSubs.add(      
      this.rptVentasSrvc.ventas_admin(this.params).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
          saveAs(blob, `Ventas_administrativo_${moment().format(GLOBAL.dateTimeFormatRptName)}.xls`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Ventas administrativo', { duration: 3000 });
        }
      })
    );
  }  

}
