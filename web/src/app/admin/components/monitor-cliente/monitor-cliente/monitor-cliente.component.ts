import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { MonitorClienteService } from '@admin-services/monitor-cliente.service';
import { UltimaComandaComponent } from '@admin-components/monitor-cliente/ultima-comanda/ultima-comanda.component';
import { UltimaFacturaComponent } from '@admin-components/monitor-cliente/ultima-factura/ultima-factura.component';
import { FacturacionClienteComponent } from '@admin-components/monitor-cliente/facturacion-cliente/facturacion-cliente.component';
import { VentasSinFacturaClienteComponent } from '@admin-components/monitor-cliente/ventas-sin-factura-cliente/ventas-sin-factura-cliente.component';

import { Vendido, ChartStructure } from '@admin-interfaces/monitor-cliente';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-monitor-cliente',
  templateUrl: './monitor-cliente.component.html',
  styleUrls: ['./monitor-cliente.component.css']
})
export class MonitorClienteComponent implements OnInit, OnDestroy {

  @ViewChild('ultimasComandas') ultimasComandas: UltimaComandaComponent;
  @ViewChild('ultimasFacturas') ultimasFacturas: UltimaFacturaComponent;
  @ViewChild('facturacionClientes') facturacionClientes: FacturacionClienteComponent;
  @ViewChild('ventaSinFacturaClientes') ventaSinFacturaClientes: VentasSinFacturaClienteComponent;
  public cargando = false;

  private endSubs = new Subscription();

  constructor(    
    private monitorClienteSrvc: MonitorClienteService
  ) { }

  ngOnInit(): void {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadAll = () => {
    this.loadUltimosMovimientos();
    this.loadFacturacionClientes();
    this.loadVentasSinFactura()
  }

  loadUltimosMovimientos = () => {
    this.cargando = true;
    this.endSubs.add(
      this.monitorClienteSrvc.getUltimosMovimientos().subscribe(res => {
        this.ultimasComandas.ultimasComandas = res.ultimas_comandas || [];
        this.ultimasComandas.ultimasComandasFiltered = JSON.parse(JSON.stringify(this.ultimasComandas.ultimasComandas));
        this.ultimasFacturas.ultimasFacturas = res.ultimas_facturas || [];
        this.ultimasFacturas.ultimasFacturasFiltered = JSON.parse(JSON.stringify(this.ultimasFacturas.ultimasFacturas));
        this.cargando = false;
      })
    );
  }

  loadFacturacionClientes = (params: any = {}) => {
    this.cargando = true;
    this.endSubs.add(
      this.monitorClienteSrvc.getFacturacion(params).subscribe((res: Vendido[]) => {
        const datosChart: ChartStructure = { backgroundColor: [], data: [], labels: [] };
        for(const df of res) {
          datosChart.backgroundColor.push(df.color);
          datosChart.data.push(+df.venta);
          datosChart.labels.push(df.nombre_sede);
        }
        this.facturacionClientes.facturacion = datosChart;
        this.cargando = false;
      })
    );
  }

  loadVentasSinFactura = (params: any = {}) => {
    this.cargando = true;
    this.endSubs.add(
      this.monitorClienteSrvc.getVentasSinFactura(params).subscribe((res: Vendido[]) => {
        const datosChart: ChartStructure = { backgroundColor: [], data: [], labels: [] };
        for(const df of res) {
          datosChart.backgroundColor.push(df.color);
          datosChart.data.push(+df.venta);          
          datosChart.labels.push(df.nombre_sede);
        }
        this.ventaSinFacturaClientes.ventasSinFactura = datosChart;
        this.cargando = false;
      })
    );
  }

}
