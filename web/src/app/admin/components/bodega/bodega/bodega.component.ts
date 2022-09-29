import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaBodegaComponent } from '../lista-bodega/lista-bodega.component';
import { FormBodegaComponent } from '../form-bodega/form-bodega.component';
// import {BodegaService} from '../../../../wms/services/bodega.service';
import { Bodega } from '../../../../wms/interfaces/bodega';

@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.component.html',
  styleUrls: ['./bodega.component.css']
})

export class BodegaComponent implements OnInit {

  public bodega: Bodega;
  @ViewChild('lstBodega') lstBodegaComponent: ListaBodegaComponent;
  @ViewChild('frmBodega') frmBodegaComponent: FormBodegaComponent;

  constructor() {
    this.bodega = {
      bodega: null,
      descripcion: "",
      sede: null,
      merma: null,
      pordefecto: 0,
      permitir_requisicion: 0,
      debaja: 0
    }
   }

  ngOnInit() {
  }

  setBodega = (bode: Bodega) => {
    // console.log(bode);
    this.bodega = bode;
    this.frmBodegaComponent.bodega = bode;
  };

  refreshBodegaList = () => this.lstBodegaComponent.getBodegas();

}
