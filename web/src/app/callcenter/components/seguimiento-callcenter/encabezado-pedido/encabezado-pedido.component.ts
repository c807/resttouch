import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

import { DetalleFormaPagoComponent } from '../detalle-forma-pago/detalle-forma-pago.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-encabezado-pedido',
  templateUrl: './encabezado-pedido.component.html',
  styleUrls: ['./encabezado-pedido.component.css']
})
export class EncabezadoPedidoComponent implements OnInit, OnDestroy {

  get tiempoTranscurrido() {
    return (tiempo: string) => moment.duration(moment().diff(moment(tiempo))).locale('es').humanize();
  }

  @Input() pedido: any;

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  verDetalleFormaPago = () => {
    const cmdRef = this.dialog.open(DetalleFormaPagoComponent, {
      width: '50%', 
      disableClose: true,
      data: { pedido: this.pedido }
    });

    this.endSubs.add(cmdRef.afterClosed().subscribe(() => {}));
  }

}
