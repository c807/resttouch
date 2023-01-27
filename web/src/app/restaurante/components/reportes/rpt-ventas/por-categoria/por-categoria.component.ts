import { Component, OnInit, Input } from '@angular/core';

import { PorCategoria } from '@restaurante-interfaces/reporte-ventas';

@Component({
  selector: 'app-por-categoria',
  templateUrl: './por-categoria.component.html',
  styleUrls: ['./por-categoria.component.css']
})
export class PorCategoriaComponent implements OnInit {

  @Input() params: any = {};
  @Input() data: PorCategoria[] = [];

  constructor() { }

  ngOnInit() {
  }

}
