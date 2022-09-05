import { Component, OnInit, OnDestroy } from '@angular/core';

import { Cuenta } from '../../../../restaurante/interfaces/cuenta';
import { ComandaService } from '../../../../restaurante/services/comanda.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cuenta-cobrada-otra-estacion',
  templateUrl: './cuenta-cobrada-otra-estacion.component.html',
  styleUrls: ['./cuenta-cobrada-otra-estacion.component.css']
})
export class CuentaCobradaOtraEstacionComponent implements OnInit, OnDestroy {

  public cargando = false;
  public params: any = {
    comanda: null,
    cerrada: 0
  };
  public cuentas: Cuenta[] = [];

  private endSubs = new Subscription();

  constructor(
    public comandaSrvc: ComandaService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  obtenerCuentasAbiertas = () => {
    this.cargando = true;
    this.cuentas = [];
    this.endSubs.add(
      this.comandaSrvc.getCuentasComanda(this.params).subscribe(res => {
        this.cuentas = res;
        this.cargando = false;
      })
    );
  }

  procesar = () => {

  }


}
