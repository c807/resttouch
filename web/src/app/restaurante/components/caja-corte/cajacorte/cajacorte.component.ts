import { Component, OnInit, ViewChild } from '@angular/core';

import { CajacorteListaComponent } from '@restaurante-components/caja-corte/cajacorte-lista/cajacorte-lista.component';
import { ccGeneral } from '@restaurante-interfaces/cajacorte';

@Component({
  selector: 'app-cajacorte',
  templateUrl: './cajacorte.component.html',
  styleUrls: ['./cajacorte.component.css']
})
export class CajacorteComponent implements OnInit {
  public ccorte: ccGeneral;
  @ViewChild('lstCortecaja') lstCajacorteComponent: CajacorteListaComponent;

  constructor() {}

  ngOnInit() {
  }

  editarCajaCorte = (pres: any) => this.ccorte = pres;

  actualizaLista = () => this.lstCajacorteComponent.getCajascortes();

}
