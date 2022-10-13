import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MonitorClienteService } from '../../../services/monitor-cliente.service';
import { UltimaComandaComponent } from '../ultima-comanda/ultima-comanda.component';
import { UltimaFacturaComponent } from '../ultima-factura/ultima-factura.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-monitor-cliente',
  templateUrl: './monitor-cliente.component.html',
  styleUrls: ['./monitor-cliente.component.css']
})
export class MonitorClienteComponent implements OnInit, OnDestroy {

  @ViewChild('ultimasComandas') ultimasComandas: UltimaComandaComponent;
  @ViewChild('ultimasFacturas') ultimasFacturas: UltimaFacturaComponent;
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,    
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
}
