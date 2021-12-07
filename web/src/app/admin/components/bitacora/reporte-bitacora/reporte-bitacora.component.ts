import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';
import { saveAs } from 'file-saver';

import { UsuarioSede } from '../../../interfaces/acceso';
import { BitacoraService } from '../../../services/bitacora.service';
import { AccesoUsuarioService } from '../../../services/acceso-usuario.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reporte-bitacora',
  templateUrl: './reporte-bitacora.component.html',
  styleUrls: ['./reporte-bitacora.component.css']
})
export class ReporteBitacoraComponent implements OnInit, OnDestroy {

  get configBotones() {
    const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid();
    return {
      showPdf: false, showHtml: false, showExcel: true, isExcelDisabled: deshabilitar
    }
  };

  public params: any = {};
  public cargando = false;
  public tablas: any[] = [];
  public sedesUsuario: UsuarioSede[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private bitacoraSrvc: BitacoraService,
    private accesoUsuarioSrvc: AccesoUsuarioService
  ) { }

  ngOnInit(): void {
    this.resetParams();
    this.loadTablas();
    this.loadSedesPorUsuario();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadTablas = () => {
    this.endSubs.add(
      this.bitacoraSrvc.getTablas().subscribe(res => this.tablas = res)
    );
  }

  loadSedesPorUsuario = () => {
    this.endSubs.add(
      this.accesoUsuarioSrvc.getSedes({reporte: true}).subscribe(res => this.sedesUsuario = res)
    );
  }

  resetParams = () => {
    this.params = {      
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
      tabla: null,
      comentario: null,
      ultimos: 500,
      usrname: null,
      sedes: null,
      sede: null
    };
    this.cargando = false;
  }

  getReporte = () => {    
    this.cargando = true;    
    if (this.params.sedes && this.params.sedes.length > 0) {
      this.params.sede = this.params.sedes.join(',');
    } else {
      this.params.sede = null;
    }
    this.endSubs.add(      
      this.bitacoraSrvc.reporte(this.params).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
          saveAs(blob, `Bitacora_${moment().format(GLOBAL.dateTimeFormatRptName)}.xls`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Bitácora', { duration: 3000 });
        }
      })
    );
  }

}
