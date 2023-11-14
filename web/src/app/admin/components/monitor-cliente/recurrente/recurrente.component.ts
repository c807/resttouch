import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { PideCorreoClienteComponent } from './pide-correo-cliente/pide-correo-cliente.component';
import { PideDatosCobroComponent } from './pide-datos-cobro/pide-datos-cobro.component';

import { ClienteRT } from '@admin-interfaces/notificacion-cliente';
import { ClienteRecurrente } from '@admin-interfaces/recurrente';
import { NotificacionClienteService } from '@admin-services/notificacion-cliente.service';
import { RecurrenteService } from '@admin-services/recurrente.service';

import { Subscription } from 'rxjs';
import { isNotNullOrUndefined } from '@shared/global';

@Component({
  selector: 'app-recurrente',
  templateUrl: './recurrente.component.html',
  styleUrls: ['./recurrente.component.css']
})
export class RecurrenteComponent implements OnInit, OnDestroy {

  public listaClientes: ClienteRT[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private notificacionClienteSrvc: NotificacionClienteService,
    private ls: LocalstorageService,
    private recurrenteSrvc: RecurrenteService
  ) { }

  ngOnInit(): void {
    this.loadListaClientes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadListaClientes = () => {
    this.endSubs.add(
      this.notificacionClienteSrvc.getListaClientes().subscribe(lst => this.listaClientes = lst)
    );
  }

  generarIdClienteRecurrente = (c: ClienteRT, idx: number) => {
    const notiDialog = this.dialog.open(PideCorreoClienteComponent, {
      width: '40%',
      autoFocus: true,
      disableClose: true
    });
    this.endSubs.add(notiDialog.afterClosed().subscribe((correo: string) => {
      if (isNotNullOrUndefined(correo)) {
        const cliRecurrente = {
          idcliente: c.id,
          email: correo,
          full_name: `${c.cliente} (${c.dominio})`
        };
        this.endSubs.add(
          this.recurrenteSrvc.crearCliente(cliRecurrente).subscribe(res => {
            if (res.exito) {
              this.listaClientes[idx].id_recurrente = (res.cliente_recurrente as ClienteRecurrente).id || null;
              this.snackBar.open(res.mensaje, 'Cliente de recurrente.com', { duration: 3000 });
            } else {
              this.snackBar.open(`ERROR: ${res.mensaje}`, 'Cliente de recurrente.com', { duration: 3000 });
            }
          })
        );
      }
    }));
  }

  generarCobroEnRecurrente = (c: ClienteRT, idx: number) => {
    const notiDialog = this.dialog.open(PideDatosCobroComponent, {
      width: '40%',
      autoFocus: true,
      disableClose: true
    });
    this.endSubs.add(notiDialog.afterClosed().subscribe((datos_cobro: { nombre_producto_recurrente: string, monto: number }) => {
      if (isNotNullOrUndefined(datos_cobro)) {
        const objCobro = {
          idcliente: c.id,
          nombre_producto_recurrente: datos_cobro.nombre_producto_recurrente,
          monto: datos_cobro.monto,
          id_recurrente: c.id_recurrente
        };
        this.endSubs.add(
          this.recurrenteSrvc.generarCobro(objCobro).subscribe(res => {
            if (res.exito) {
              this.listaClientes[idx].ultimo_monto = datos_cobro.monto;
              this.listaClientes[idx].ultimo_checkout = res.checkout_recurrente.checkout_url;
              this.listaClientes[idx].fecha_ultimo_checkout = res.checkout_recurrente.fecha_ultimo_checkout;
              this.snackBar.open(res.mensaje, 'Cobro de recurrente.com', { duration: 3000 });
            } else {
              this.snackBar.open(`ERROR: ${res.mensaje}`, 'Cobro de recurrente.com', { duration: 3000 });
            }
          })
        );
      }
    }));
  }
}
