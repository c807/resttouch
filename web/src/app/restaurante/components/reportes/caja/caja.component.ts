import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ReportePdfService} from '../../../services/reporte-pdf.service';
import {TipoTurno} from '../../../interfaces/tipo-turno';
import {TipoTurnoService} from '../../../services/tipo-turno.service';
import {UsuarioSede} from '../../../../admin/interfaces/acceso'
import {AccesoUsuarioService} from '../../../../admin/services/acceso-usuario.service'
import {saveAs} from 'file-saver';
import {GLOBAL} from '../../../../shared/global';
import {FpagoService} from '../../../../admin/services/fpago.service';
import {FormaPago} from '../../../../admin/interfaces/forma-pago';
import * as moment from 'moment';

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css']
})
export class CajaComponent implements OnInit {

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
    _validar: false,
    sede: [],
    fdel: moment().format(GLOBAL.dbDateFormat),
    fal: moment().format(GLOBAL.dbDateFormat),
    porTurno: false
  };
  public titulo = 'Resumen de caja';
  public tiposTurno: TipoTurno[] = [];
  public cargando = false;
  public fpagos: FormaPago[] = [];
  public sedes: UsuarioSede[] = [];
  public grupos = GLOBAL.grupos;


  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService,
    private tipoTurnoSrvc: TipoTurnoService,
    private fpagoSrvc: FpagoService,
    private sedeSrvc: AccesoUsuarioService
  ) {
  }

  ngOnInit() {
    this.loadTiposTurno();
    this.loadFormaPago();
    this.loadSedes();
  }

  loadFormaPago = () => {
    this.fpagoSrvc.get().subscribe(res => {
      if (res) {
        this.fpagos = res;
      }
    })
  }

  loadSedes = () => {
    this.sedeSrvc.getSedes({reporte: true}).subscribe(res => {
      if (res) {
        this.sedes = res
      }
    })
  }

  loadTiposTurno = () => {
    this.tipoTurnoSrvc.get().subscribe(res => {
      if (res) {
        this.tiposTurno = res;
      }
    });
  }

  resetParams = () => {
    this.params = {
      fdel: moment().format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat)
    };
    this.cargando = false;
  }

  // excelClick = () => {
  //   this.cargando = true;
  //   this.params._pagos = this.fpagos;
  //   this.params._excel = 1;

  //   this.pdfServicio.getReporteCaja(this.params).subscribe(res => {
  //     this.cargando = false;
  //     if (res) {
  //       const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
  //       saveAs(blob, `${this.titulo}.xls`);
  //     } else {
  //       this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
  //     }
  //   });
  // }


  printPorTurno(enExcel = 0) {
    this.pdfServicio.getReporteCajaTurno(this.params).subscribe(res => {
      this.cargando = false;
      if (res) {

        console.log(res);
        const blob = new Blob([res], {type: (+enExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel')});
        saveAs(blob, `${this.titulo}.${+enExcel === 0 ? 'pdf' : 'xls'}`);

      } else {
        this.snackBar.open('No se pudo generar el reporte...', this.titulo, {duration: 3000});
      }
    });

  }

  onSubmit(enExcel = 0, enComandera = 0) {
    if (this.params.porTurno) {
      this.printPorTurno(enExcel);
      return;
    }

    this.cargando = true;
    this.params._pagos = this.fpagos;
    this.params._excel = enExcel;
    this.params._encomandera = enComandera;

    this.pdfServicio.getReporteCaja(this.params).subscribe(res => {
      this.cargando = false;
      if (res) {
        if (+enComandera === 1) {
          const blob = new Blob([res], {type: 'application/json'});
          const fr = new FileReader();
          fr.onload = (e) => {
            const obj = JSON.parse((e.target.result as string));
            this.sendToImpresora(obj);
          };
          fr.readAsText(blob);
        } else {
          const blob = new Blob([res], {type: (+enExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel')});
          saveAs(blob, `${this.titulo}.${+enExcel === 0 ? 'pdf' : 'xls'}`);
        }
      } else {
        this.snackBar.open('No se pudo generar el reporte...', this.titulo, {duration: 3000});
      }
    });
  }

  sendToImpresora = async (res: any) => {
    console.log(res);


  }

}
