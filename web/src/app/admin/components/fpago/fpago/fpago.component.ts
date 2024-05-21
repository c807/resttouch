import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaPagoComponent } from '@admin-components/fpago/lista-pago/lista-pago.component';
import { FormPagoComponent } from '@admin-components/fpago/form-pago/form-pago.component'
import { FormaPago } from '@admin-interfaces/forma-pago';

@Component({
  selector: 'app-fpago',
  templateUrl: './fpago.component.html',
  styleUrls: ['./fpago.component.css']
})
export class FpagoComponent implements OnInit {

  public fpago: FormaPago;
  @ViewChild('lstFPago') lstFpagoComponent: ListaPagoComponent;
  @ViewChild('frmFpago') frmFpago: FormPagoComponent;

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
      permitir_propina: 1,
      escobrohabitacion: 0,
      porcentaje_maximo_descuento: 0.00,
      porcentaje_descuento_aplicado: 0
    };
  }

  ngOnInit() { }

  setFormPago = (cli: FormaPago) => {
    this.fpago = cli;
    this.frmFpago.fpago = this.fpago;
    this.frmFpago.resetFpscc();
    this.frmFpago.mtgFPago.selectedIndex = 0;    
  };
  
  refreshFpagoList = () => this.lstFpagoComponent.getFormasPago();
}
