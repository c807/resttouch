import {Component, OnDestroy, OnInit} from '@angular/core';

import * as moment from 'moment';
import {GLOBAL} from "../../../../shared/global";
import {UsuarioSedeRPT} from "../../../../admin/interfaces/acceso";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Usuario} from "../../../../admin/interfaces/usuario";
import {Subscription} from "rxjs";
import {TipoDomicilio} from "../../../interfaces/tipo-domicilio";
import {AccesoUsuarioService} from "../../../../admin/services/acceso-usuario.service";
import {LocalstorageService} from "../../../../admin/services/localstorage.service";
import {TipoDomicilioService} from "../../../services/tipo-domicilio.service";
import {saveAs} from 'file-saver';
import {RtpPedidosService} from "../../../services/rtp_pedidos.service";



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
      this.sedeSrvc.getSedes({reporte: true}).subscribe(res => {
        this.sedes = res;
      })
    );
  }


  loadTiposDomicilio = () => {
    this.endSubs.add(
      this.tipoDomicilioSrvc.get().subscribe(res => {
        console.log(res);
        this.tiposDomicilio = res;
      })
    );
  }

  loadTiposReporte = () => {
    this.tiposReporte = [
      {tipo_reporte: 1, descripcion: 'Por categoría'},
      {tipo_reporte: 2, descripcion: 'Por artículo'},
      {tipo_reporte: 3, descripcion: 'Por categoría agrupado por combo'},
      {tipo_reporte: 4, descripcion: 'Por mesero'}
    ];
  }


  resetParams = () => {

    this.msgGenerandoReporte = null;
    this.params = {
      tipo_reporte: undefined,
      fdel: moment().startOf('week').format(GLOBAL.dbDateFormat),
      fal: moment().endOf('week').format(GLOBAL.dbDateFormat),
      tipo_venta: undefined
    };
    this.cargando = false;
  }

  getReporte = (tipo: number = 1) => {
    this.paramsToSend = JSON.parse(JSON.stringify(this.params));
    this.msgGenerandoReporte = 'GENERANDO REPORTE EN ';
    //console.log(this.paramsToSend);

    switch (tipo) {
      case 2 :
        this.getPdf();
        break;
      case 3 :
        this.getExcel();
        break;
    }
  }

  getPdf = () => {

    this.requestPDF();

  }

  getExcel = () => {

    this.requestExcel(1);

  }

  requestPDF = (esExcel = 0) => {
    this.paramsToSend._excel = esExcel;
    this.cargando = true;
    this.cleanParams();
    this.paramsToSend.fdel = moment(this.paramsToSend.fdel).format('YYYY-MM-DD');
    this.paramsToSend.fal = moment(this.paramsToSend.fal).format('YYYY-MM-DD');
    if (this.params.sede !== undefined && this.params.sede !== null) {
      this.paramsToSend.sedeNName = this.sedes.find(element => element.sede.sede === this.params.sede).sede.nombre;
      console.log(this.params);
      console.log(this.sedes);
      console.log(this.sedes.find(element => element.sede.sede === this.params.sede).sede.nombre);
    }
    if (this.params.tipo_venta !== undefined && this.params.tipo_venta !== null) {
      this.paramsToSend.tipoDName = this.tiposDomicilio[this.params.tipo_venta - 1].descripcion;
    }


    this.endSubs.add(
      this.rptVentasSrvc.pedidosRTP(this.paramsToSend).subscribe(res => {
        console.log('Reporte salida ' + JSON.stringify(res));
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], {type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel')});
          saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Ventas por artículo', {duration: 3000});
        }
      })
    );
  }

  requestExcel = (esExcel = 0) => {
    this.paramsToSend._excel = esExcel;
    this.cargando = true;
    this.cleanParams();
    this.paramsToSend.fdel = moment(this.paramsToSend.fdel).format('YYYY-MM-DD');
    this.paramsToSend.fal = moment(this.paramsToSend.fal).format('YYYY-MM-DD');
    if (this.params.sede !== undefined) {
      this.paramsToSend.sedeNName = this.sedes.find(element => element.sede.sede === this.params.sede).sede.nombre;
    }
    if (this.params.tipo_venta !== undefined) {
      this.paramsToSend.tipoDName = this.tiposDomicilio[this.params.tipo_venta - 1].descripcion;
    }


    this.endSubs.add(
      this.rptVentasSrvc.pedidosRTP(this.paramsToSend).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], {type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel')});
          saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Ventas por artículo', {duration: 3000});
        }
      })
    );
  }

  cleanParams = () => delete this.paramsToSend.tipo_reporte;

}
