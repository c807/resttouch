import { Component, OnInit } from '@angular/core';
import { MultiFiltro } from '../../../../shared/global';

import { UltimaFactura } from '../../../interfaces/monitor-cliente';

@Component({
  selector: 'app-ultima-factura',
  templateUrl: './ultima-factura.component.html',
  styleUrls: ['./ultima-factura.component.css']
})
export class UltimaFacturaComponent implements OnInit {

  public ultimasFacturas: UltimaFactura[] = [];
  public ultimasFacturasFiltered: UltimaFactura[] = [];
  public txtFiltro = '';

  constructor() { }

  ngOnInit(): void {
  }

  applyFilter = () => {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.ultimasFacturas, this.txtFiltro);      
      this.ultimasFacturasFiltered = JSON.parse(JSON.stringify(tmpList));
    } else {      
      this.ultimasFacturasFiltered = JSON.parse(JSON.stringify(this.ultimasFacturas));;
    }    
  }

}
