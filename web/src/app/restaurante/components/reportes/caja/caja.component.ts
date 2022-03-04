import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportePdfService } from '../../../services/reporte-pdf.service';
import { TipoTurno } from '../../../interfaces/tipo-turno';
import { TipoTurnoService } from '../../../services/tipo-turno.service';
import { UsuarioSede } from '../../../../admin/interfaces/acceso'
import { AccesoUsuarioService } from '../../../../admin/services/acceso-usuario.service'
import { saveAs } from 'file-saver';
import { GLOBAL } from '../../../../shared/global';
import { FpagoService } from '../../../../admin/services/fpago.service';
import { FormaPago } from '../../../../admin/interfaces/forma-pago';
import { Socket } from 'ngx-socket-io';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { ImpresionCorteCaja } from '../../../interfaces/cajacorte';
import { Impresora } from '../../../../admin/interfaces/impresora';
import { ImpresoraService } from '../../../../admin/services/impresora.service';
import { Impresion } from '../../../classes/impresion';
import * as moment from 'moment';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css']
})
export class CajaComponent implements OnInit, OnDestroy {

  get configBotones() {
    const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid();
    return {
      showPdf: true, showHtml: false, showExcel: true, showImprimir: true,
      isPdfDisabled: deshabilitar,
      isExcelDisabled: deshabilitar,
      isImprimirDisabled: deshabilitar
    }
  };

  public params: any = {
    porTurno: false,
    _validar: false,
    sede: [],
    fdel: moment().format(GLOBAL.dbDateFormat),
    fal: moment().format(GLOBAL.dbDateFormat),
  };
  public titulo = 'Resumen de caja';
  public tiposTurno: TipoTurno[] = [];
  public cargando = false;
  public fpagos: FormaPago[] = [];
  public sedes: UsuarioSede[] = [];
  public grupos = GLOBAL.grupos;
  public impresora: Impresora;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private tipoTurnoSrvc: TipoTurnoService,
    private fpagoSrvc: FpagoService,
    private sedeSrvc: AccesoUsuarioService,
    private socket: Socket,
    private ls: LocalstorageService,
    private impresoraSrvc: ImpresoraService
  ) { }

  ngOnInit() {
    this.conectarAWS();
    this.loadTiposTurno();
    this.loadFormaPago();
    this.loadSedes();
    this.loadImpresoraDefecto();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  conectarAWS = () => {
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);

      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));

      this.socket.on('connect_timeout', () => {
        const msg = 'DESCONECTADO DEL SERVIDOR (TIMEOUT)';
        this.snackBar.open(msg, 'ERROR', { duration: 5000 });
      });

      this.socket.on('reconnect_attempt', (attempt: number) => this.snackBar.open(`INTENTO DE RECONEXIÓN #${attempt}`, 'ERROR', { duration: 10000 }));
    }
  }

  loadImpresoraDefecto = () => {
    this.endSubs.add(
      this.impresoraSrvc.get({ sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0) , pordefecto: 1 }).subscribe(res => {
        if (res && res.length > 0) {
          this.impresora = res[0];
        }
      })
    );
  }

  loadFormaPago = () => {
    this.endSubs.add(this.fpagoSrvc.get().subscribe(res => this.fpagos = res));
  }

  loadSedes = () => {
    this.endSubs.add(this.sedeSrvc.getSedes({ reporte: true }).subscribe(res => this.sedes = res));
  }

  loadTiposTurno = () => {
    this.endSubs.add(this.tipoTurnoSrvc.get().subscribe(res => this.tiposTurno = res));
  }

  resetParams = () => {
    this.params = {
      fdel: moment().format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat)
    };
    this.cargando = false;
  }

  printPorTurno(enExcel = 0) {

    this.pdfServicio.getReporteCajaTurno(this.params).subscribe(res => {
      this.cargando = false;
      if (res) {

        console.log(res);
        const blob = new Blob([res], {type: (+enExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel')});
        saveAs(blob, `${this.titulo}.${+enExcel === 0 ? 'pdf' : 'xls'}`);

      } else {
        this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
      }
    });

  }

  onSubmit(enExcel = 0, enComandera = 0) {
    this.cargando = true;
    this.params._pagos = this.fpagos;
    this.params._excel = enExcel;
    this.params._encomandera = enComandera;

    if(this.params.porTurno){
      console.log("Printing por turno");
      this.printPorTurno();
      return;
    }


    this.endSubs.add(
      this.pdfServicio.getReporteCaja(this.params).subscribe(res => {
        this.cargando = false;
        if (res) {
          if (+enComandera === 1) {
            const blob = new Blob([res], { type: 'application/json' });
            const fr = new FileReader();
            fr.onload = (e) => {
              const obj = JSON.parse((e.target.result as string));
              this.sendToImpresora(obj);
            };
            fr.readAsText(blob);
          } else {
            const blob = new Blob([res], { type: (+enExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
            saveAs(blob, `${this.titulo}.${+enExcel === 0 ? 'pdf' : 'xls'}`);
          }
        } else {
          this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
        }
      })
    );
  }

  sendToImpresora = (res: any) => {
    const obj: ImpresionCorteCaja = {
      Empresa: res.empresa.nombre,
      Sede: res.nsede,
      FechaDel: moment(res.fdel).format(GLOBAL.dateFormat),
      FechaAl: moment(res.fal).format(GLOBAL.dateFormat),
      Turno: res.turno?.descripcion || null,
      TotalDeComensales: res.totalComensales,
      Impresora: this.impresora || null,
      Ingresos: res.ingresos || [],
      FacturasSinComanda: res.facturas_sin_comanda || [],
      Descuentos: res.descuentos || []
    }

    const imprimir = new Impresion(this.socket, this.ls);
    imprimir.imprimirCorteCaja(obj);
  }

}
