import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { ChartStructure } from '@admin-interfaces/monitor-cliente';

@Component({
  selector: 'app-ventas-sin-factura-cliente',
  templateUrl: './ventas-sin-factura-cliente.component.html',
  styleUrls: ['./ventas-sin-factura-cliente.component.css']
})
export class VentasSinFacturaClienteComponent implements OnInit {

  @Output() refrescarVentasSinFacturaEv = new EventEmitter();
  
  public ventasSinFactura: ChartStructure = { backgroundColor: [], data: [], labels: [] };
  public params: any = {
    fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
    fal: moment().format(GLOBAL.dbDateFormat)
  };

  public chartTooltips: Object = { 
    callbacks: {
        label: (item, data) => {
            let label = data.datasets[item.datasetIndex].labels[item.index] || '';
            let value = data.datasets[item.datasetIndex].data[item.index] || 0;

            if (label) {
                label += ': ';
            }

            label += parseFloat(value).toLocaleString('en');

            return label;
        }
    }
}

  public chartOptions: Object = {
    responsive: true,
    legend: {
        display: false
    },
    maintainAspectRatio: true,
    tooltips: this.chartTooltips
}

  constructor() { }

  ngOnInit(): void {
  }

  reloadVentas = () => {
    this.refrescarVentasSinFacturaEv.emit(this.params);
  }

}
