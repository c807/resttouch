import { Component, OnInit, Input } from '@angular/core';
import { WindowConfiguration } from '../../../shared/interfaces/window-configuration';

const infoMesaTest = {
  area: 'Area 01',
  noMesa: 1,
  cuentas: [
    { numero: 1, nombre: 'Juan' },
    { numero: 2, nombre: 'Pedro' },
    { numero: 3, nombre: 'Pablo' }
  ]
};

interface productoSelected {
  id: number;
  nombre: string;
  noCuenta?: number;
  cantidad: number;
  impreso: boolean;
  precio?: number;
}

@Component({
  selector: 'app-tran-comanda',
  templateUrl: './tran-comanda.component.html',
  styleUrls: ['./tran-comanda.component.css']
})
export class TranComandaComponent implements OnInit {

  @Input() mesaEnUso: any;
  private lstProductosSeleccionados: productoSelected[];
  private lstProductosDeCuenta: productoSelected[];
  private lstProductosAImprimir: productoSelected[];
  private cuentaSeleccionada: string = null;
  private noCuentaSeleccionada: number = null;
  private showPortalComanda: boolean = false;
  private showPortalCuenta: boolean = false;
  private windowConfig: WindowConfiguration;
  private noComanda: number = 0;
  private sumCuenta: number = 0;

  constructor() { }

  ngOnInit() {
    this.mesaEnUso = infoMesaTest;
    this.resetLstProductosSeleccionados();
    this.resetLstProductosDeCuenta();
  }

  resetLstProductosSeleccionados = () => this.lstProductosSeleccionados = [];
  resetLstProductosDeCuenta = () => this.lstProductosDeCuenta = [];

  setSelectedCuenta(noCuenta: number) {
    const ctaSel = this.mesaEnUso.cuentas.find((c: any) => c.numero === noCuenta);
    this.cuentaSeleccionada = ctaSel.nombre;
    this.noCuentaSeleccionada = noCuenta;
    this.setLstProductosDeCuenta();
  }

  setSumaCuenta(lista: productoSelected[]) {
    let suma:number = 0.00;
    for(let i = 0; i < lista.length; i++) {
      suma += (lista[i].precio * lista[i].cantidad);
    }
    this.sumCuenta = suma;
  }

  setLstProductosDeCuenta() {
    this.lstProductosDeCuenta = this.lstProductosSeleccionados.filter(p => p.noCuenta == this.noCuentaSeleccionada);
  }

  addProductoSelected(producto: any) {
    if (this.noCuentaSeleccionada) {
      const idx = this.lstProductosSeleccionados.findIndex(p => p.id == producto.id && p.noCuenta == this.noCuentaSeleccionada && p.impreso == false);

      if (idx < 0) {
        this.lstProductosSeleccionados.push({ id: producto.id, nombre: producto.nombre, noCuenta: this.noCuentaSeleccionada, cantidad: 1, impreso: false, precio: producto.precio });
      } else {
        this.lstProductosSeleccionados[idx].cantidad++;
      }

      this.setLstProductosDeCuenta();
    }
  }

  updProductosCuenta(nvaLista: productoSelected[] = []) {
    let lstTemp: productoSelected[] = this.lstProductosSeleccionados.filter(p => p.noCuenta != this.noCuentaSeleccionada);
    if (nvaLista.length > 0) {
      this.lstProductosSeleccionados = lstTemp.concat(nvaLista);
    } else {
      this.lstProductosSeleccionados = lstTemp;
    }
  }

  printComanda() {
    this.lstProductosAImprimir = this.lstProductosDeCuenta.filter(p => !p.impreso);
    this.lstProductosDeCuenta.map(p => p.impreso = true);
    this.noComanda = Math.floor(Math.random() * 100);
    this.windowConfig = { width: 325, height: 550, left: 200, top: 200, menubar: 'no', resizable: 'no', titlebar: 'no', toolbar: 'no' };
    this.showPortalComanda = true;
  }

  printCuenta() {
    this.lstProductosAImprimir = this.lstProductosDeCuenta.filter(p => p.impreso);
    this.setSumaCuenta(this.lstProductosAImprimir);
    this.windowConfig = { width: 325, height: 550, left: 200, top: 200, menubar: 'no', resizable: 'no', titlebar: 'no', toolbar: 'no' };
    this.showPortalCuenta = true;
  }

}
