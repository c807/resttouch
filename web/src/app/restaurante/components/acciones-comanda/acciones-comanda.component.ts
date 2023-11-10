import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { TranComandaAltComponent } from '@restaurante-components/tran-comanda-alt/tran-comanda-alt.component';
import { TranComanda } from '@restaurante-classes/tran-comanda';

import { NotificacionClienteService } from '@admin-services/notificacion-cliente.service';
import { NotificacionesClienteComponent } from '@admin/components/notificaciones-cliente/notificaciones-cliente.component';

import { Subscription } from 'rxjs';

interface ITranComanda {
  tranComanda: TranComanda;
  dialogRef: MatDialogRef<TranComandaAltComponent>;
}

@Component({
  selector: 'app-acciones-comanda',
  templateUrl: './acciones-comanda.component.html',
  styleUrls: ['./acciones-comanda.component.css']
})
export class AccionesComandaComponent implements OnInit, OnDestroy {

  private endSubs = new Subscription();

  constructor(
    private bsAccionesComanda: MatBottomSheetRef<AccionesComandaComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: ITranComanda,
    public dialog: MatDialog,
    private notificacionClienteSrvc: NotificacionClienteService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  cerrar = (obj: any = { cerrar: false }) => this.bsAccionesComanda.dismiss(obj);

  notasGenerales = () => {
    this.data.tranComanda.getNotasGenerales();
    this.cerrar();
  }

  comandar = () => {
    this.data.tranComanda.validarImpresion(false, this.data.dialogRef);
    this.cerrar();
  }

  imprimirCuenta = () => {
    this.data.tranComanda.printCuenta(this.data.dialogRef);
    this.cerrar();
  }

  distribuirProductos = () => {
    this.data.tranComanda.distribuirProductos(this.data.dialogRef);
    this.cerrar();
  }

  unirCuentas = () => {
    this.data.tranComanda.unirCuentas(this.data.dialogRef);
    this.cerrar();
  }

  cobrarCuenta = () => {
    this.data.tranComanda.cobrarCuenta(this.data.dialogRef);
    this.cerrar();
  }

  enviarPedido = () => {
    this.data.tranComanda.enviarPedido(this.data.dialogRef);
    this.cerrar();
  }

  trasladarMesa = (idCuenta: number = null) => {
    this.data.tranComanda.trasladoMesa(this.data.dialogRef, idCuenta);
    this.cerrar();
  }

  cerrarMesa = () => {
    this.data.tranComanda.cerrarMesa();
    this.cerrar({
      cerrar: true,
      mesaEnUso: this.data.tranComanda.mesaEnUso
    });
  }

  verHistorico = () => {
    this.data.tranComanda.verHistorico();
    this.cerrar();
  }

  execFunc = (fnc: number, param: any = null) => {
    switch(fnc) {
      case 1: this.comandar(); break;
      case 2: this.imprimirCuenta(); break;
      case 3: this.cobrarCuenta(); break;
      case 4: this.notasGenerales(); break;
      case 5: this.distribuirProductos(); break;
      case 6: this.unirCuentas(); break;
      case 7: this.verHistorico(); break;
      case 8: this.enviarPedido(); break;
      case 9: this.trasladarMesa(param); break;
      case 10: this.trasladarMesa(); break;
      case 11: this.cerrarMesa(); break;      
    }
  }

  checkNotificaciones = (fnc: number, param: any = null) => {
    this.endSubs.add(
      this.notificacionClienteSrvc.get(true).subscribe(mensajes => {
        if (mensajes && mensajes.length > 0) {
          const notiDialog = this.dialog.open(NotificacionesClienteComponent, {
            width: '75%',
            autoFocus: true,
            disableClose: true,
            data: mensajes
          });
          this.endSubs.add(notiDialog.afterClosed().subscribe(() => {            
            this.execFunc(fnc, param);
          }));
        } else {          
          this.execFunc(fnc, param);
        }
      })
    );
  }  
}
