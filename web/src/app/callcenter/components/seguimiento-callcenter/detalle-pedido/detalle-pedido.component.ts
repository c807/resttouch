import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.css']
})
export class DetallePedidoComponent implements OnInit {

  @Input() detallePedido: any[];

  constructor() { }

  ngOnInit(): void {
  }

}
