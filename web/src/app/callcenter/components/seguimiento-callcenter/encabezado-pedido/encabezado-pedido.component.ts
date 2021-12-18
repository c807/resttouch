import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-encabezado-pedido',
  templateUrl: './encabezado-pedido.component.html',
  styleUrls: ['./encabezado-pedido.component.css']
})
export class EncabezadoPedidoComponent implements OnInit {

  get tiempoTranscurrido() {
    return (tiempo: string) => moment.duration(moment().diff(moment(tiempo))).locale('es').humanize();
  }

  @Input() pedido: any;

  constructor() { }

  ngOnInit(): void {
  }

}
