import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, OnChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../shared/global';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SeleccionaTurnoPrevioComponent } from '../selecciona-turno-previo/selecciona-turno-previo.component';
import { CajacorteListaComponent } from '../../caja-corte/cajacorte-lista/cajacorte-lista.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { TipoTurno } from '../../../interfaces/tipo-turno';
import { TipoTurnoService } from '../../../services/tipo-turno.service';
import { Turno } from '../../../interfaces/turno';
import { DetalleTurno } from '../../../interfaces/detalle-turno';
import { TurnoService } from '../../../services/turno.service';
import { UsuarioTipo } from '../../../../admin/interfaces/usuario-tipo';
import { UsuarioTipoService } from '../../../../admin/services/usuario-tipo.service';
import { Usuario } from '../../../../admin/models/usuario';
import { UsuarioService } from '../../../../admin/services/usuario.service';
import { ccGeneral } from '../../../interfaces/cajacorte';

@Component({
  selector: 'app-form-turno',
  templateUrl: './form-turno.component.html',
  styleUrls: ['./form-turno.component.css']
})
export class FormTurnoComponent implements OnInit, OnChanges, OnDestroy {

  get descripcionCaja() {
    if (+this.turno?.turno > 0 && this.turno?.inicio) {
      return `Caja del turno ${moment(this.turno.inicio).format(GLOBAL.dateTimeFormat)}`;
    }
    return '';
  }

  @Input() turno: Turno;
  @Output() turnoSavedEv = new EventEmitter();
  @ViewChild('lstCajaCorte') lstCajaCorte: CajacorteListaComponent;

  public showTurnoForm = true;
  public showDetalleTurnoForm = true;

  public detallesTurno: DetalleTurno[] = [];
  public detalleTurno: DetalleTurno;
  public displayedColumns: string[] = ['usuario_tipo', 'usuario', 'editItem'];
  public dataSource: MatTableDataSource<DetalleTurno>;
  public tiposTurno: TipoTurno[] = [];
  public tiposUsuario: UsuarioTipo[] = [];
  public usuarios: Usuario[] = [];
  public esMovil = false;
  public comandas: any[] = [];
  public facturas: any[] = [];
  public pendientes = false;
  public listacc: ccGeneral[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private tipoTurnoSrvc: TipoTurnoService,
    private turnoSrvc: TurnoService,
    private usuarioTipoSrvc: UsuarioTipoService,
    private usuarioSrvc: UsuarioService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetTurno();
    this.loadTiposTurno();
    this.loadTiposUsuario();
    this.loadUsuarios();
  }

  ngOnChanges(changes): void {
    if (+changes.turno?.currentValue?.turno > 0) {
      // console.log('CAMBIOS = ', changes.turno.currentValue);
      this.lstCajaCorte.idTurno = +changes.turno.currentValue.turno;
      this.lstCajaCorte.turno = changes.turno.currentValue;
      this.lstCajaCorte.getCajascortes();
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadTiposTurno = () => {
    this.endSubs.add(
      this.tipoTurnoSrvc.get().subscribe(res => {
        if (res) {
          this.tiposTurno = res;
        }
      })
    );
  }

  loadTiposUsuario = () => {
    this.endSubs.add(
      this.usuarioTipoSrvc.get().subscribe(res => {
        if (res) {
          this.tiposUsuario = res;
        }
      })
    );
  }

  loadUsuarios = () => {
    this.endSubs.add(
      this.usuarioSrvc.get({ sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0) }).subscribe(res => {
        if (res) {
          this.usuarios = res;
        }
      })
    );
  }

  resetTurno = () => {
    this.pendientes = false;
    this.comandas = [];
    this.facturas = [];
    this.turno = {
      turno: null, turno_tipo: null, inicio: moment().format(GLOBAL.dbDateTimeFormat), fin: null
    };
    this.resetDetalleTurno();
    this.detallesTurno = [];
    this.updateTableDataSource();
    if (this.lstCajaCorte) {
      this.lstCajaCorte.idTurno = null;
      this.lstCajaCorte.turno = null;
      this.lstCajaCorte.listacc = [];
    }
  }

  saveInfoTurno = () => {
    this.pendientes = false;
    this.endSubs.add(
      this.turnoSrvc.save(this.turno).subscribe(res => {
        if (res.exito) {
          this.turnoSavedEv.emit();
          this.resetTurno();
          this.turno = res.turno;
          this.snackBar.open('Turno modificado con éxito...', 'Turno', { duration: 3000 });
        } else {
          if (res.pendientes) {
            this.snackBar.open(`ERROR: Error al cerrar el turno`, 'Turno', { duration: 3000 });
            this.pendientes = true;
            this.comandas = res.comandas;
            this.facturas = res.facturas;
          }
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Turno', { duration: 3000 });
        }
      })
    );
  }

  checkCierreCaja = (): boolean => {
    let cerrada = true;
    if (this.listacc.length > 0) {
      cerrada = false;
      for(const cc of this.listacc) {
        if (+cc.caja_corte_tipo.caja_corte_tipo === 4) {
          cerrada = true;
          break;
        }
      }
    }
    return cerrada;
  }

  onSubmit = () => {
    if (moment(this.turno.fin).isValid()) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel('Cerrar turno', 'La fecha de finalización cerrará el turno. ¿Desea continuar?', 'Sí', 'No')
      });

      this.endSubs.add(
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            if (this.checkCierreCaja()) {
              this.saveInfoTurno();
            } else {
              this.snackBar.open('No puede cerrar el turno si no tiene saldo final de caja.', 'Turno', { duration: 7000 });
            }
          }
        })
      );
    } else if (!this.turno.turno) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel('Turno', 'Al abrir un nuevo turno, TRASLADARÁ LAS MESAS ABIERTAS al nuevo turno (en caso de que hubiesen). ¿Desea continuar?', 'Sí', 'No')
      });

      this.endSubs.add(
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            this.saveInfoTurno();
          }
        })
      );
    } else {
      this.saveInfoTurno();
    }
  }

  resetDetalleTurno = () => this.detalleTurno = { turno: !!this.turno.turno ? this.turno.turno : null, usuario: null, usuario_tipo: null };

  loadDetalleTurno = (idturno: number = +this.turno.turno) => {
    this.endSubs.add(
      this.turnoSrvc.getDetalle(idturno, { turno: idturno }).subscribe(res => {
        if (res) {
          this.detallesTurno = res;
          this.updateTableDataSource();
        }
      })
    );
  }

  onSubmitDetail = () => {
    this.detalleTurno.turno = this.turno.turno;
    this.endSubs.add(
      this.turnoSrvc.saveDetalle(this.detalleTurno).subscribe(res => {
        if (res.exito) {
          this.loadDetalleTurno();
          this.resetDetalleTurno();
          this.snackBar.open('Usuario agregado al turno...', 'Turno', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Turno', { duration: 3000 });
        }
      })
    );
  }

  anularDetalleTurno = (obj: any) => {
    this.endSubs.add(
      this.turnoSrvc.anularDetalle({ turno: obj.turno, usuario: obj.usuario.usuario, usuario_tipo: obj.usuario_tipo.usuario_tipo }).subscribe(res => {
        if (res.exito) {
          this.loadDetalleTurno();
          this.resetDetalleTurno();
          this.snackBar.open('Se quitó al usuario del turno...', 'Turno', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Turno', { duration: 3000 });
        }
      })
    );
  }

  updateTableDataSource = () => this.dataSource = new MatTableDataSource(this.detallesTurno);

  getNow = () => moment().format(GLOBAL.dbDateTimeFormat);

  copiaDetalleTurno = () => {
    const dialogRef = this.dialog.open(SeleccionaTurnoPrevioComponent, {
      maxWidth: '400px',
      data: { turnoCopia: this.turno }
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(() => this.loadDetalleTurno(+this.turno.turno))
    );
  }

  setListaCC = (lst: ccGeneral[]) => {
    this.listacc = lst
    // console.log(this.listacc);
  };
}
