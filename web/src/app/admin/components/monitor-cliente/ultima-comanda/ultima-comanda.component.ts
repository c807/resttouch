import { Component, OnInit } from '@angular/core';
import { MultiFiltro } from '../../../../shared/global';

import { UltimaComanda } from '../../../interfaces/monitor-cliente';

@Component({
  selector: 'app-ultima-comanda',
  templateUrl: './ultima-comanda.component.html',
  styleUrls: ['./ultima-comanda.component.css']
})
export class UltimaComandaComponent implements OnInit {

  public ultimasComandas: UltimaComanda[] = [];
  public ultimasComandasFiltered: UltimaComanda[] = [];
  public txtFiltro = '';

  constructor() { }

  ngOnInit(): void {
  }

  applyFilter = () => {
    if (this.txtFiltro.length > 0) {
      const tmpList = MultiFiltro(this.ultimasComandas, this.txtFiltro);      
      this.ultimasComandasFiltered = JSON.parse(JSON.stringify(tmpList));
    } else {      
      this.ultimasComandasFiltered = JSON.parse(JSON.stringify(this.ultimasComandas));;
    }    
  }

}
