import { Component, OnInit } from '@angular/core';

import { DatosPie } from '../../../interfaces/monitor-cliente';

@Component({
  selector: 'app-facturacion-cliente',
  templateUrl: './facturacion-cliente.component.html',
  styleUrls: ['./facturacion-cliente.component.css']
})
export class FacturacionClienteComponent implements OnInit {

  public facturacion: DatosPie = { backgroundColor: [], data: [], labels: [] };    

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

  public pieOptions: Object = {
    responsive: true,
    legend: {
        position: 'bottom',
        align: 'start'
    },
    maintainAspectRatio: true,
    tooltips: this.chartTooltips
}

  constructor() { }

  ngOnInit(): void {
  }

}
