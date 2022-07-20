import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { InitialSetup } from '../../../interfaces/setup';
import { SetupService } from '../../../services/setup.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-initial-setup',
  templateUrl: './initial-setup.component.html',
  styleUrls: ['./initial-setup.component.css']
})
export class InitialSetupComponent implements OnInit, OnDestroy {

  public configInicial: InitialSetup;
  public esMovil = false;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private setupSrvc: SetupService
  ) { }

  ngOnInit(): void {
    this.esMovil = (this.ls.get(GLOBAL.usrTokenVar).enmovil as boolean) || false;
    this.resetConfigInicial();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetConfigInicial = () => this.configInicial = {
    esquema: null, dominio: null, nombre_cliente: null, corporacion: null, empresa: null, sede: null, nombres: 'Admin', apellidos: 'SPC', usuario: 'admin'
  };

  onSubmit = () => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Crear nueva base de datos',
        'Este proceso creará una nueva base de datos y puede tardar un poco. ¿Desea continuar?',
        'Sí',
        'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.cargando = true;
          this.endSubs.add(
            this.setupSrvc.nuevo_esquema(this.configInicial).subscribe(res => {
              this.snackBar.open(`${res.exito ? '' : 'ERROR: '}${res.mensaje}`, 'Configuración inicial', { duration: 7000 });
              this.cargando = false;
              if(res.exito) {
                this.resetConfigInicial();
              }
            })
          );
        }
      })
    );
  }
  
  validateChars = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[a-z0-9_]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }
}
