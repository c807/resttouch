import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../shared/global';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SeleccionaTurnoPrevioComponent } from '../selecciona-turno-previo/selecciona-turno-previo.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

import { TipoTurno } from '../../../interfaces/tipo-turno';
import { TipoTurnoService } from '../../../services/tipo-turno.service';
import { Turno } from '../../../interfaces/turno';
import { DetalleTurno } from '../../../interfaces/detalle-turno';
import { TurnoService } from '../../../services/turno.service';
import { UsuarioTipo } from '../../../../admin/interfaces/usuario-tipo';
import { UsuarioTipoService } from '../../../../admin/services/usuario-tipo.service';
import { Usuario } from '../../../../admin/models/usuario';
import { UsuarioService } from '../../../../admin/services/usuario.service';

@Component({
  selector: 'app-form-turno',
  templateUrl: './form-turno.component.html',
  styleUrls: ['./form-turno.component.css']
})
export class FormTurnoComponent implements OnInit {

  @Input() turno: Turno;
  @Output() turnoSavedEv = new EventEmitter();

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

  loadTiposTurno = () => {
    this.tipoTurnoSrvc.get().subscribe(res => {
      if (res) {
        this.tiposTurno = res;
      }
    });
  }

  loadTiposUsuario = () => {
    this.usuarioTipoSrvc.get().subscribe(res => {
      if (res) {
        this.tiposUsuario = res;
      }
    });
  }

  loadUsuarios = () => {
    this.usuarioSrvc.get({ sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0) }).subscribe(res => {
      if (res) {
        this.usuarios = res;
      }
    });
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
  }

  saveInfoTurno = () => {
    this.pendientes = false;
    this.turnoSrvc.save(this.turno).subscribe(res => {
      if (res.exito) {
        this.turnoSavedEv.emit();
        this.resetTurno();
        this.turno = res.turno;
        this.snackBar.open('Turno modificado con éxito...', 'Turno', { duration: 3000 });
      } else {
        // console.log(res.mensaje);
        if (res.pendientes) {
          this.snackBar.open(`ERROR: Error al cerrar el turno`, 'Turno', { duration: 3000 });
          this.pendientes = true;
          this.comandas = res.comandas;
          this.facturas = res.facturas;
        }

        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Turno', { duration: 3000 });

      }
    });
  }

  onSubmit = () => {
    if (moment(this.turno.fin).isValid()) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel('Cerrar turno', 'La fecha de finalización cerrará el turno. ¿Desea continuar?', 'Sí', 'No')
      });

      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.saveInfoTurno();
        }
      });

    } else {
      this.saveInfoTurno();
    }
  }

  resetDetalleTurno = () => this.detalleTurno = { turno: !!this.turno.turno ? this.turno.turno : null, usuario: null, usuario_tipo: null };

  loadDetalleTurno = (idturno: number = +this.turno.turno) => {
    this.turnoSrvc.getDetalle(idturno, { turno: idturno }).subscribe(res => {
      // console.log(res);
      if (res) {
        this.detallesTurno = res;
        this.updateTableDataSource();
      }
    });
  }

  onSubmitDetail = () => {
    this.detalleTurno.turno = this.turno.turno;
    // console.log(this.detalleTurno); return;
    this.turnoSrvc.saveDetalle(this.detalleTurno).subscribe(res => {
      // console.log(res);
      if (res.exito) {
        this.loadDetalleTurno();
        this.resetDetalleTurno();
        this.snackBar.open('Usuario agregado al turno...', 'Turno', { duration: 3000 });
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Turno', { duration: 3000 });
      }
    });
  }

  anularDetalleTurno = (obj: any) => {
    // console.log(obj);
    this.turnoSrvc.anularDetalle({
      turno: obj.turno, usuario: obj.usuario.usuario, usuario_tipo: obj.usuario_tipo.usuario_tipo
    }).subscribe(res => {
      // console.log(res);
      if (res.exito) {
        this.loadDetalleTurno();
        this.resetDetalleTurno();
        this.snackBar.open('Se quitó al usuario del turno...', 'Turno', { duration: 3000 });
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Turno', { duration: 3000 });
      }
    });
  }

  updateTableDataSource = () => this.dataSource = new MatTableDataSource(this.detallesTurno);

  getNow = () => moment().format(GLOBAL.dbDateTimeFormat);

  copiaDetalleTurno = () => {
    const dialogRef = this.dialog.open(SeleccionaTurnoPrevioComponent, {
      maxWidth: '400px',
      data: { turnoCopia: this.turno }
    });

    dialogRef.afterClosed().subscribe(() =>  this.loadDetalleTurno(+this.turno.turno));
  }

}
