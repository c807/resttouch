import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaNotaPredefinidaComponent } from '@restaurante-components/nota-predefinida/lista-nota-predefinida/lista-nota-predefinida.component';
import { NotaPredefinida } from '@restaurante-interfaces/nota-predefinida';

@Component({
  selector: 'app-nota-predefinida',
  templateUrl: './nota-predefinida.component.html',
  styleUrls: ['./nota-predefinida.component.css']
})
export class NotaPredefinidaComponent implements OnInit {

  public notaPredefinida: NotaPredefinida;
  @ViewChild('lstNotaPredefinida') lstNotaPredefinida: ListaNotaPredefinidaComponent;

  constructor() { }

  ngOnInit(): void {
    this.notaPredefinida = { nota_predefinida: null, nota: null };
  }

  setNotaPredefinida = (np: NotaPredefinida) => this.notaPredefinida = np;

  refreshNotaPredefinidaList = () => this.lstNotaPredefinida.loadNotasPredefinidas();

}
