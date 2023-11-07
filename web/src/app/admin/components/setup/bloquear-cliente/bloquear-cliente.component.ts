import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL, MultiFiltro } from '@shared/global';
import { ClienteRT } from '@admin-interfaces/notificacion-cliente';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { NotificacionClienteService } from '@admin-services/notificacion-cliente.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bloquear-cliente',
  templateUrl: './bloquear-cliente.component.html',
  styleUrls: ['./bloquear-cliente.component.css']
})
export class BloquearClienteComponent implements OnInit, OnDestroy {

  public lstClientes: ClienteRT[] = [];
  public lstClientesFull: ClienteRT[] = [];
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public cargando: boolean = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private notificacionClienteSrvc: NotificacionClienteService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadListaClientes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadListaClientes = () => {
    this.cargando = true;
    this.notificacionClienteSrvc.getListaClientes().subscribe(lst => {
      this.lstClientes = lst;
      this.lstClientesFull = [...this.lstClientes];
      this.cargando = false;
    });
  }

  toggleBloqueoCliente = (elCliente: ClienteRT, idx: number) => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Bloqueo de acceso',
        `Esto ${+elCliente.bloqueado === 0 ? 'bloqueará' : 'desbloqueará'} el acceso del cliente '${elCliente.cliente} (${elCliente.dominio})' a RestTouch Pro. ¿Está seguro(a) y tiene la autorización para realizarlo?`,
        'Sí', 'No'
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(cnf => {
        if (cnf) {
          this.cargando = true;
          this.endSubs.add(
            this.notificacionClienteSrvc.toggleBloqueoCliente(elCliente.id).subscribe(res => {
              this.lstClientes[idx].bloqueado = res.bloqueado;
              this.cargando = false;
            })
          );
        }
      })
    );
  }

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      this.lstClientes = MultiFiltro(this.lstClientesFull, this.txtFiltro);
    } else {
      this.lstClientes = [...this.lstClientesFull];
    }
  }

}
