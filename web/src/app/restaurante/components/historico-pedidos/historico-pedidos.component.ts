import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import { ClienteMasterService } from '../../../callcenter/services/cliente-master.service';
import { ComandaService } from '../../services/comanda.service';

import { Subscription } from 'rxjs';

interface IHistoricoPedidosDialog {
  cliente_master: number,
  nombre: string,
  comanda: number
}

@Component({
  selector: 'app-historico-pedidos',
  templateUrl: './historico-pedidos.component.html',
  styleUrls: ['./historico-pedidos.component.css']
})
export class HistoricoPedidosComponent implements OnInit, OnDestroy {

  public historico: any[] = [];
  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<HistoricoPedidosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IHistoricoPedidosDialog,
    public clienteMasterSrvc: ClienteMasterService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public comandaSrvc: ComandaService
  ) { }

  ngOnInit(): void {
    this.loadHistorico();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadHistorico = () => {
    this.endSubs.add(
      this.clienteMasterSrvc.getHistoricoPedidos({ cliente_master: this.data.cliente_master }).subscribe((histo) => {
        this.historico = histo;
      }
    ));
  }

  terminar = () => this.dialogRef.close();

  duplicarPedido = (idComanda: number) => {
    if (this.data.comanda && +this.data.comanda > 0 && idComanda && +idComanda > 0) {
      console.log(`Duplicando pedido ${idComanda} en ${this.data.comanda}`);
      const confDialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel('Duplicar pedido', 'Esto duplicará el pedido seleccionado. ¿Desea continuar?', 'Sí', 'No')
      });
  
      this.endSubs.add(        
        confDialogRef.afterClosed().subscribe((conf: boolean) => {
          if (conf) {
            const params = {
              comanda_origen: idComanda,
              comanda_destino: this.data.comanda
            }
            this.endSubs.add(
              this.comandaSrvc.duplicarDetalleComanda(params).subscribe((resDuplicado) => {
                if (resDuplicado.exito) {
                  this.snackBar.open('Pedido duplicado con éxito.', 'Duplicar pedido', { duration: 3000 });
                  this.terminar();
                } else {
                  this.snackBar.open(`ERROR: ${resDuplicado.mensaje}`, 'Duplicar pedido', { duration: 7000 });
                }
              })
            );
          }
        })
      );
    } else {
      this.snackBar.open('Faltan datos para poder duplicar el pedido.', 'Comanda', { duration: 5000 });
    }
  }

}
