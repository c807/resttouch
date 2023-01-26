import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaPagoComponent } from '@admin-components/fpago/lista-pago/lista-pago.component';
import { FormaPago } from '@admin-interfaces/forma-pago';

@Component({
  selector: 'app-fpago',
  templateUrl: './fpago.component.html',
  styleUrls: ['./fpago.component.css']
})
export class FpagoComponent implements OnInit {

  public fpago: FormaPago;
  @ViewChild('lstFPago') lstFpagoComponent: ListaPagoComponent;

   constructor() {
    this.fpago = {
      forma_pago: null,
      descripcion: null,
      descuento: 0,
      aumento_porcentaje: 0.00,
      comision_porcentaje: 0.00,
      retencion_porcentaje: 0.00,
      pedirdocumento: 0,
      pedirautorizacion: 0,
      adjuntararchivo: 0,
      sinfactura: 0,
      activo: 1,
      escobrohabitacion: 0
    };
  }

  ngOnInit() { }

  setFormPago = (cli: FormaPago) => this.fpago = cli;
  refreshFpagoList = () => this.lstFpagoComponent.getFormasPago();
}
