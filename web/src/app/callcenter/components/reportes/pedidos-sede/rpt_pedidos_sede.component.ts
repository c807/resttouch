import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, openInNewTab } from '@shared/global';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { UsuarioSedeRPT } from '@admin-interfaces/acceso';
import { Usuario } from '@admin-interfaces/usuario';
import { TipoDomicilio } from '@callcenter-interfaces/tipo-domicilio';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { TipoDomicilioService } from '@callcenter-services/tipo-domicilio.service';
import { RtpPedidosService } from '@callcenter-services/rtp_pedidos.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rpt-pedidos-sede',
  templateUrl: './rpt_pedidos_sede.component.html',
  styleUrls: ['./rpt_pedidos_sede.component.css']
})

export class RtpPedidosComponent implements OnInit, OnDestroy {

  get configBotones() {
    const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid();
    return {
      showPdf: true, showHtml: false, showExcel: true,
      isPdfDisabled: deshabilitar,
      isExcelDisabled: deshabilitar
    }
  };

  public tiposReporte: any[] = [];
  public params: any = {};
  public paramsToSend: any = {};
  public msgGenerandoReporte: string = null;
  public sedes: UsuarioSedeRPT[] = [];
  public tituloArticulo = 'Pedidos_Sede';
  public cargando = false;
  public usuarios: Usuario[] = [];
  public tiposDomicilio: TipoDomicilio[] = [];
  // public archivo_pdf: string = null;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private rptVentasSrvc: RtpPedidosService,
    private sedeSrvc: AccesoUsuarioService,
    private ls: LocalstorageService,
    private tipoDomicilioSrvc: TipoDomicilioService
  ) {
  }

  ngOnInit() {
    this.resetParams();
    this.loadTiposReporte();
    this.loadSedes();
    this.loadTiposDomicilio();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.getSedes({ reporte: true }).subscribe(res => {
        this.sedes = res;
      })
    );
  }

  loadTiposDomicilio = () => {
    this.endSubs.add(
      this.tipoDomicilioSrvc.get().subscribe(res => {
        // console.log(res);
        this.tiposDomicilio = res;
      })
    );
  }

  loadTiposReporte = () => {
    this.tiposReporte = [
      { tipo_reporte: 1, descripcion: 'Por categoría' },
      { tipo_reporte: 2, descripcion: 'Por artículo' },
      { tipo_reporte: 3, descripcion: 'Por categoría agrupado por combo' },
      { tipo_reporte: 4, descripcion: 'Por mesero' }
    ];
  }

  resetParams = () => {
    this.msgGenerandoReporte = null;
    this.params = {
      fdel: moment().format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
      sede: undefined,
      tipo_venta: undefined
    };
    // this.archivo_pdf = null;
    this.cargando = false;
  }

  requestPDF = (esExcel = 0) => {
    this.paramsToSend = JSON.parse(JSON.stringify(this.params));
    this.paramsToSend._excel = esExcel;
    this.cargando = true;
    // this.cleanParams();
    this.paramsToSend.fdel = moment(this.paramsToSend.fdel).format('YYYY-MM-DD');
    this.paramsToSend.fal = moment(this.paramsToSend.fal).format('YYYY-MM-DD');

    if (this.params.sede !== undefined && this.params.sede !== null) {
      // console.log(this.params);
      const idx = this.sedes.findIndex(s => +s.sede.sede === +this.params.sede);
      if (idx > -1) {
        this.paramsToSend.sedeNName = `${this.sedes[idx].sede.nombre} (${this.sedes[idx].sede.alias})`;
      }
    }

    if (this.params.tipo_venta !== undefined && this.params.tipo_venta !== null) {
      const idx = this.tiposDomicilio.findIndex(td => +td.tipo_domicilio === +this.params.tipo_venta);
      if (idx > -1) {
        this.paramsToSend.tipoDName = this.tiposDomicilio[idx].descripcion;
      }
    }


    this.endSubs.add(
      this.rptVentasSrvc.pedidosRTP(this.paramsToSend).subscribe(res => {
        // console.log('Reporte salida ' + JSON.stringify(res));
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
          if (+esExcel === 0) {            
            openInNewTab(URL.createObjectURL(blob));
          } else {
            saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
          }
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Reporte de pedidos.', { duration: 3000 });
        }
      })
    );
  }
}
