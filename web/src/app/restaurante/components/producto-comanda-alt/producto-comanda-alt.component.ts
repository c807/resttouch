import { Component, OnInit, Input } from '@angular/core';

import { DetalleCuentaSimplified } from '../../interfaces/cuenta';

@Component({
  selector: 'app-producto-comanda-alt',
  templateUrl: './producto-comanda-alt.component.html',
  styleUrls: ['./producto-comanda-alt.component.css']
})
export class ProductoComandaAltComponent implements OnInit {

  get sinDecimales() {
    return (cant: number) => {
      if ((cant % 1) === 0) {
        return true;
      }      
      return false;
    }
  }

  @Input() detalle: DetalleCuentaSimplified[] = [];
  @Input() paddingLeft = 0;
  public paddingLeftStr = '';

  constructor() { }

  ngOnInit(): void {
    this.paddingLeft += 10;
    this.paddingLeftStr = `${this.paddingLeft}px`;
  }

}
