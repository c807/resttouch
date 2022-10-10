import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsuarioSede } from 'src/app/admin/interfaces/acceso';
import { ConfiguracionBotones } from 'src/app/shared/interfaces/config-reportes';
import { Bodega } from 'src/app/wms/interfaces/bodega';
import { saveAs } from 'file-saver';
import { GLOBAL } from '../../../../shared/global';

import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportePdfService } from '../../../../restaurante/services/reporte-pdf.service';
import { AccesoUsuarioService } from '../../../../admin/services/acceso-usuario.service';
import { BodegaService } from 'src/app/wms/services/bodega.service';

import * as moment from 'moment';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rpt-lista-pedidos',
  templateUrl: './rpt-lista-pedidos.component.html',
  styleUrls: ['./rpt-lista-pedidos.component.css']
})
export class RptListaPedidosComponent implements OnInit, OnDestroy {

  public bodegas: Bodega[] = [];
  public sedes: UsuarioSede[] = [];
  public params: any = {};
  public titulo: string = 'Lista_Pedidos';
  public cargando = false;
  public configBotones: ConfiguracionBotones = {
    showPdf: true, showHtml: false, showExcel: true
  };
  public lstSubCategorias: any[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private sedeSrvc: AccesoUsuarioService,
    private bodegaSrvc: BodegaService,
  ) { }

  ngOnInit(): void {
    this.params.fecha = moment().format(GLOBAL.dbDateFormat);
    this.getSede();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  getSede = (params: any = {}) => {
    this.endSubs.add(
      this.sedeSrvc.getSedes(params).subscribe(res => {
        this.sedes = res;
      })
    );
  }

  getBodega = (params: any = {}) => {
    this.endSubs.add(
      this.bodegaSrvc.get(params).subscribe(res => {
        this.bodegas = res;
      })
    );
  }

  onSedesSelected = (obj: any) => {
    this.getBodega({ sede: this.params.sede });
  }

  resetParams = () => {
    this.params = {
      sede: null,
      bodega: null,
      fecha: moment().format(GLOBAL.dbDateFormat),
      fecha_del: null
    };
    this.cargando = false;
  }

  onSubmit(esExcel = 0) {
    if (this.params.sede && this.params.bodega && this.params.fecha && moment(this.params.fecha).isValid()) {
      this.params.fecha_del = moment(this.params.fecha).add(1, 'days').format(GLOBAL.dbDateFormat);      
      this.cargando = true;   
      if (+esExcel === 1) {
        this.params._excel = true;
      } else {
        delete this.params._excel;
      }
      this.endSubs.add(
        this.pdfServicio.getListaPedidos(this.params).subscribe(res => {
          this.cargando = false;
          if (res) {
            const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
            saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
          } else {
            this.snackBar.open('No se pudo generar el reporte...', 'Pedidos', { duration: 3000 });
          }
        })
      );
    } else {
      this.snackBar.open('Por favor ingrese todos los parámetros.', 'Pedidos', { duration: 7000 });
    }
  }
}
