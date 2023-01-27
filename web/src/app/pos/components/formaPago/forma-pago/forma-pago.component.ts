import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaFormaPagoComponent } from '@pos-components/formaPago/lista-forma-pago/lista-forma-pago.component';
import { FormaPago } from '@pos-interfaces/forma-pago';

@Component({
  selector: 'app-forma-pago',
  templateUrl: './forma-pago.component.html',
  styleUrls: ['./forma-pago.component.css']
})
export class FormaPagoComponent implements OnInit {

  public formaPago: FormaPago;
  @ViewChild('lstFormaPago') lstFormaPagoComponent: ListaFormaPagoComponent;

  constructor() {
    this.formaPago = { forma_pago: null, descripcion: null, activo: 1 };
  }

  ngOnInit() {
  }

  setFormaPago = (fp: FormaPago) => this.formaPago = fp;

  refreshFormaPagoList = () => this.lstFormaPagoComponent.loadFormasPago();

}
