import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Usuario } from '@admin-models/usuario';
import { UsuarioBodega } from '@admin-interfaces/usuario';
import { UsuarioService } from '@admin-services/usuario.service';
import { Sede } from '@admin-interfaces/sede';
import { SedeService } from '@admin-services/sede.service';
import { ConfiguracionService } from '@admin-services/configuracion.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { Rol } from '@admin-interfaces/rol';
import { RolService } from '@admin-services/rol.service';
import { Bodega } from '@wms-interfaces/bodega';
import { BodegaService } from '@wms-services/bodega.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-usuario',
  templateUrl: './form-usuario.component.html',
  styleUrls: ['./form-usuario.component.css']
})
export class FormUsuarioComponent implements OnInit, OnDestroy {

  get disableSede() {
    return (+this.ls.get(GLOBAL.usrTokenVar).idusr === +this.usuario.usuario);
  }

  get disableRol() {
    return this.usuario?.rol && (+this.ls.get(GLOBAL.usrTokenVar).idusr === +this.usuario.usuario);
  }

  get bodegaYaEnListado() {
    return (idBodegSeleccionada: string) => {
      return this.bodegasUsuario.find(bu => +bu.bodega === +idBodegSeleccionada);
    }
  }

  @Input() usuario: Usuario;
  @Output() usrSavedEv = new EventEmitter();
  public sedes: Sede[] = [];
  public habilitaBloqueo = false;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public roles: Rol[] = [];
  public bodegasUsuario: UsuarioBodega[] = [];
  public bodegas: Bodega[] = [];
  public bodegaSeleccionada: string = null;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private usuarioSrvc: UsuarioService,
    private sedeSrvc: SedeService,
    private configSrvc: ConfiguracionService,
    private ls: LocalstorageService,
    private bodegaSrvc: BodegaService,
    public dialog: MatDialog,
    private rolSrvc: RolService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.habilitaBloqueo = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_HABILITA_BLOQUEO_INACTIVIDAD) as boolean;
    this.loadSedes();
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.get().subscribe(res => {
        this.sedes = res;
      })
    );
  }

  loadRoles = () => {
    this.endSubs.add(
      this.rolSrvc.get().subscribe(res => {
        this.roles = res;
      })
    );
  }

  resetUsuario() {
    this.usuario = new Usuario(null, null, null, null, null, null, 0, 0, null, 0, 0, 0, null, 0);
  }

  onSubmit() {
    if (+this.usuario.debaja === 0) {
      this.guardarUsuario();
    } else {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel(
          'De baja', `¿Está seguro(a) de dar de baja a ${this.usuario.nombres + ' ' + this.usuario.apellidos}?`, 'Sí', 'No'
        )
      });
      this.endSubs.add(
        dialogRef.afterClosed().subscribe(cnf => {
          if (cnf) {
            this.guardarUsuario();
          }
        })
      );
    }
  }

  guardarUsuario = () => {
    this.endSubs.add(
      this.usuarioSrvc.save(this.usuario).subscribe((res) => {
        this.resetUsuario();
        this.usrSavedEv.emit();
        this.snackBar.open(res.mensaje, 'Usuario', { duration: 5000 });
      })
    );
  }

  loadBodegasUsuario = (idUsuario: number = null) => {
    if (!idUsuario && this.usuario?.usuario) {
      idUsuario = +this.usuario.usuario;
    }

    this.endSubs.add(
      this.usuarioSrvc.getBodegasUsuario({ usuario: idUsuario }).subscribe(res => {
        this.bodegasUsuario = res;
      })
    );
  }

  guardarBodegaUsuario = (ub: UsuarioBodega) => {
    this.endSubs.add(
      this.usuarioSrvc.saveBodegaUsuario(ub).subscribe(res => {
        this.loadBodegasUsuario(+ub.usuario);
        this.bodegaSeleccionada = null;
        this.snackBar.open(res.mensaje, 'Usuario bodega', { duration: 5000 });
      })
    );
  }

  saveUsuarioBodega = (idBodega: string) => {    
    if (+idBodega > 0 && +this.usuario.usuario > 0) {
      const ub = {
        usuario_bodega: null,
        usuario: +this.usuario.usuario,
        bodega: +idBodega,
        debaja: 0        
      };
      this.guardarBodegaUsuario(ub);
    }
  }

  toggleUsuarioBodegaDeBaja = (ub: UsuarioBodega) => {
    ub.debaja = +ub.debaja === 0 ? 1 : 0;
    this.guardarBodegaUsuario(ub);
  }

  loadBodegas = () => {
    this.endSubs.add(
      this.bodegaSrvc.get({ sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0) }).subscribe((res: Bodega[]) => {
        this.bodegas = res;        
      })
    );
  }
}
