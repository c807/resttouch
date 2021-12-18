import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaAreaComponent } from '../lista-area/lista-area.component';
import { Area } from '../../../interfaces/area';


@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css']
})
export class AreaComponent implements OnInit {

  public area: Area;
  @ViewChild('listaAreas') lstAreasComponent: ListaAreaComponent;

  constructor() {
    this.area = {area: null, sede: null, nombre: null, impresora: null, impresora_factura: null, escallcenter: null};
  }

  ngOnInit() {
  }

  setArea = (obj: Area) => this.area = obj;

  refreshAreaList = () => {
    this.lstAreasComponent.loadEntidades();
  }

}
