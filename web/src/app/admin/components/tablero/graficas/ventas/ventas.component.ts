import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ChartDataSets } from 'chart.js';
// import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-graficas-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VentasComponent implements OnInit {

  @Input() datos: any = {};  

  dsPorDia: ChartDataSets[] = [];
  lblsPorDia: string[] = [];

  dsPorCategoria: ChartDataSets[] = [];
  lblsPorCategoria: string[] = [];

  dsPorTurno: ChartDataSets[] = [];
  lblsPorTurno: string[] = [];

  dsPorMesero: ChartDataSets[] = [];
  lblsPorMesero: string[] = [];

  constructor() { }

  ngOnInit() { }

  setGraficas = () => {
    this.setGraficaPorDia();
    this.setGraficaPorCategoria();
    this.setGraficaPorTurno();
    this.setGraficaPorMesero();
  }

  setGraficaPorDia = () => {    
    this.dsPorDia = [];
    this.lblsPorDia = [];
    if (this.datos.porDia) {
      this.datos.porDia.forEach((pd: any) => {
        const dataPorDia: number[] = [];
        pd.datos.forEach((d: any) => {
          dataPorDia.push(+d.venta);
          const idx = this.lblsPorDia.indexOf(d.fecha);
          if (idx < 0) {
            this.lblsPorDia.push(d.fecha);
          }
        });

        this.dsPorDia.push(
          {
            data: dataPorDia,
            label: pd.nombre
          }
        );
      });
    }
  }

  setGraficaPorCategoria = () => {    
    this.dsPorCategoria = [];
    this.lblsPorCategoria = [];
    if (this.datos.porCategoria) {
      this.datos.porCategoria.forEach((pd: any) => {
        const data: number[] = [];
        pd.datos.forEach((d: any) => {
          data.push(+d.venta);
          const idx = this.lblsPorCategoria.indexOf(d.categoria);
          if (idx < 0) {
            this.lblsPorCategoria.push(d.categoria);
          }
        });

        this.dsPorCategoria.push(
          {
            data,
            label: pd.nombre
          }
        );
      });
    }
  }

  setGraficaPorTurno = () => {    
    this.dsPorTurno = [];
    this.lblsPorTurno = [];
    if (this.datos.porTurno) {
      this.datos.porTurno.forEach((pd: any) => {
        const data: number[] = [];
        pd.datos.forEach((d: any) => {
          data.push(+d.venta);
          const idx = this.lblsPorTurno.indexOf(d.turno);
          if (idx < 0) {
            this.lblsPorTurno.push(d.turno);
          }
        });

        this.dsPorTurno.push(
          {
            data,
            label: pd.nombre
          }
        );
      });
    }
  }

  setGraficaPorMesero = () => {    
    this.dsPorMesero = [];
    this.lblsPorMesero = [];
    if (this.datos.porMesero) {
      this.datos.porMesero.forEach((pd: any) => {
        const data: number[] = [];
        pd.datos.forEach((d: any) => {
          data.push(+d.venta);
          const idx = this.lblsPorMesero.indexOf(d.mesero);
          if (idx < 0) {
            this.lblsPorMesero.push(d.mesero);
          }
        });

        this.dsPorMesero.push(
          {
            data,
            label: pd.nombre
          }
        );
      });
    }
  }

}
