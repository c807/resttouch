import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';

import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { Sede } from '../../../interfaces/sede';
import { SedeService } from '../../../services/sede.service';
import { ConfiguracionService } from '../../../services/configuracion.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

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

  @Input() usuario: Usuario;
  @Output() usrSavedEv = new EventEmitter();
  public sedes: Sede[] = [];
  public habilitaBloqueo = false;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private usuarioSrvc: UsuarioService,
    private sedeSrvc: SedeService,
    private configSrvc: ConfiguracionService,
    private ls: LocalstorageService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadSedes();
    this.habilitaBloqueo = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_HABILITA_BLOQUEO_INACTIVIDAD) as boolean;
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

  resetUsuario() {
    this.usuario = new Usuario(null, null, null, null, null, null, 0, 0, null, 0, 0, 0);    
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

}
