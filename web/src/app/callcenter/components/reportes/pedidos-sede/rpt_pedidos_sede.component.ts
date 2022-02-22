import {Component, OnDestroy, OnInit} from '@angular/core';

import * as moment from 'moment';
import {GLOBAL} from "../../../../shared/global";
import {UsuarioSede} from "../../../../admin/interfaces/acceso";
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
  public sedes: UsuarioSede[] = [];
  public tituloCategoria = 'Ventas_Categoria';
  public tituloArticulo = 'Ventas_Articulo';
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
      this.sedeSrvc.getSedes({reporte: true}).subscribe(res => this.sedes = res)
    );
  }


  loadTiposDomicilio = () => {
    this.endSubs.add(
      this.tipoDomicilioSrvc.get().subscribe(res => this.tiposDomicilio = res)
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

    this.getPorArticuloPdf();

  }

  getExcel = () => {

    this.getPorCatAgrupadoCombo(1);

  }

  getPorArticuloPdf = (esExcel = 0) => {
    this.paramsToSend._excel = esExcel;
    this.cargando = true;
    this.cleanParams();
    console.log('Generando reporte ');
    this.paramsToSend.fdel = '2022-02-07';
    this.paramsToSend.fal = '2022-02-01';
    this.endSubs.add(
      this.rptVentasSrvc.pedidosRTP(this.paramsToSend).subscribe(res => {
        console.log('Reporte salida ' + JSON.stringify(res));
        this.cargando = false;
        // if (res) {
        //   const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
        //   saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
        // } else {
        //   this.snackBar.open('No se pudo generar el reporte...', 'Ventas por artículo', { duration: 3000 });
        // }
      })
    );
  }

  getPorCatAgrupadoCombo = (esExcel = 0) => {
    this.paramsToSend._excel = esExcel;
    this.cargando = true;
    this.cleanParams();
    console.log('Generando reporte ');
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

  cleanParams = () => delete this.paramsToSend.tipo_reporte;

}
