import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { CheckPasswordComponent, ConfigCheckPasswordModel } from '../../../../shared/components/check-password/check-password.component';
import { CajacorteFormComponent } from '../cajacorte-form/cajacorte-form.component';
import { CajaCortePreviewComponent } from '../caja-corte-preview/caja-corte-preview.component';
import { ReportePdfService } from '../../../services/reporte-pdf.service';

import { ccGeneral, ccTipo } from '../../../interfaces/cajacorte';
import { CajacorteService } from '../../../services/cajacorte.service';
import { Turno } from '../../../interfaces/turno';
import * as moment from 'moment';
import { GLOBAL } from '../../../../shared/global';
import { saveAs } from 'file-saver';

import { ImpresionCorteCaja } from '../../../interfaces/cajacorte';
import { Impresora } from '../../../../admin/interfaces/impresora';
import { ImpresoraService } from '../../../../admin/services/impresora.service';
import { Impresion } from '../../../classes/impresion';
import { ConfiguracionService } from '../../../../admin/services/configuracion.service';
import { Socket } from 'ngx-socket-io';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

@Component({
  selector: 'app-cajacorte-lista',
  templateUrl: './cajacorte-lista.component.html',
  styleUrls: ['./cajacorte-lista.component.css']
})
export class CajacorteListaComponent implements OnInit, OnDestroy {

  get deshabilitaTipoCC() {
    return (tipo: ccTipo) => {
      if (
        this.turno &&
        moment(this.turno.fin).isValid() ||
        (+tipo.unico === 1 && this.listacc?.findIndex(cct => +cct.caja_corte_tipo?.caja_corte_tipo === +tipo.caja_corte_tipo && +cct.anulado === 0) > -1) ||
        (+tipo.caja_corte_tipo > 1 && this.listacc?.findIndex(cct => +cct.caja_corte_tipo?.caja_corte_tipo === 1 && +cct.anulado === 0)) < 0
      ) {
        return true;
      }
      return false;
    };
  }

  // @Output() getCajacorteEv = new EventEmitter();
  @Output() listaCCEv = new EventEmitter();
  public idTurno: number = null;
  public turno: Turno = null;
  public listacc: ccGeneral[];
  public ccorteTipo: ccTipo[] = [];
  public impresora: Impresora;

  private endSubs = new Subscription();

  constructor(
    private ccorteSrvc: CajacorteService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private pdfServicio: ReportePdfService,
    private impresoraSrvc: ImpresoraService,
    private socket: Socket,
    private ls: LocalstorageService,
    private configSrvc: ConfiguracionService
  ) { }

  ngOnInit() {
    this.conectarAWS();
    this.loadCajaCorteTipo();
    this.loadImpresoraDefecto();
  }

  ngOnDestroy(): void {
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

  loadCajaCorteTipo = () => {
    this.endSubs.add(
      this.ccorteSrvc.getCajaCorteTipo().subscribe(res => {
        this.ccorteTipo = res;
      })
    );
  }

  loadImpresoraDefecto = () => {
    this.endSubs.add(
      this.impresoraSrvc.get({ sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0), pordefecto: 1 }).subscribe(res => {
        if (res && res.length > 0) {
          this.impresora = res[0];
        }
      })
    );
  }

  nuevaTranCC = (tipo: ccTipo): void => {
    if (!this.deshabilitaTipoCC(tipo)) {
      if (+tipo.pedirautorizacion === 0) {
        this.addTranCC(tipo);
      } else {
        const dialogChkPass = this.dialog.open(CheckPasswordComponent, {
          width: '40%',
          disableClose: true,
          data: new ConfigCheckPasswordModel(1)
        });

        this.endSubs.add(
          dialogChkPass.afterClosed().subscribe(res => {
            if (res) {
              this.addTranCC(tipo);
            } else {
              this.snackBar.open('La contraseña no es correcta.', 'Caja', { duration: 7000 });
            }
          })
        );
      }
    }
  }

  addTranCC = (tipo: ccTipo): void => {
    const dialogCCF = this.dialog.open(CajacorteFormComponent, {
      width: '50%',
      disableClose: true,
      data: { turno: this.idTurno, tipo }
    });

    this.endSubs.add(
      dialogCCF.afterClosed().subscribe(() => this.getCajascortes())
    );
  }

  getCajascortes = () => {
    this.endSubs.add(
      this.ccorteSrvc.buscar({ turno: this.idTurno }).subscribe(lst => {
        this.listacc = lst;
        this.listaCCEv.emit(this.listacc);
      })
    );
  }

  calcularSaldo = (obj: ccGeneral): number => {
    let saldo = 0;
    this.listacc.forEach(cc => {
      if (moment(cc.creacion).isBefore(moment(obj.creacion))) {
        switch (+cc.caja_corte_tipo.caja_corte_tipo) {
          case 1: saldo += +cc.total; break;
          case 2: saldo -= +cc.total; break;
        }
      }
    });
    return saldo;
  }

  imprimirCC = (obj: ccGeneral, _excel = 0, enComandera = 0) => {
    const params = {
      _validar: true,
      _excel,
      turno_tipo: this.turno.turno_tipo,
      fdel: moment(this.turno.inicio).format(GLOBAL.dbDateFormat),
      fal: this.turno.fin ? moment(this.turno.fin).format(GLOBAL.dbDateFormat) : moment().format(GLOBAL.dbDateFormat),
      sede: [this.turno.sede],
      _pagos: [],
      _saldo_actual: this.calcularSaldo(obj),
      _fecha_caja: obj.creacion,
      _encomandera: enComandera
    }

    this.endSubs.add(
      this.ccorteSrvc.getDetalleCaja(obj.caja_corte).subscribe((det: any) => {
        det.formas_pago.detalle.forEach(fp => {
          fp.forma_pago.monto = fp.total;
          params._pagos.push(fp.forma_pago);
        });
        // console.log(params);
        this.endSubs.add(
          this.pdfServicio.getReporteCaja(params).subscribe(res => {
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
                const blob = new Blob([res], { type: (_excel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
                saveAs(blob, `Caja_${moment().format(GLOBAL.dateTimeFormatRptName)}.${_excel === 0 ? 'pdf' : 'xls'}`);
              }
            } else {
              this.snackBar.open('No se pudo generar el reporte...', 'Caja', { duration: 7000 });
            }
          })
        );
      })
    );
  }

  verCC = (cc: ccGeneral) => {
    // console.log(cc);
    const dialogCCF = this.dialog.open(CajaCortePreviewComponent, {
      width: '60%',
      disableClose: true,
      data: { caja_corte: cc }
    });

    this.endSubs.add(
      dialogCCF.afterClosed().subscribe(() => { })
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
      Descuentos: res.descuentos || [],
      TipoVenta: res.tipo_venta || []
    }

    const imprimir = new Impresion(this.socket, this.ls, null, this.configSrvc);
    imprimir.imprimirCorteCaja(obj);
  }
}
