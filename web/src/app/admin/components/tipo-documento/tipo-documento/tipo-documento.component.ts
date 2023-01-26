import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTipoDocumentoComponent } from '@admin-components/tipo-documento/lista-tipo-documento/lista-tipo-documento.component';
import { TipoDocumento } from '@admin-interfaces/tipo-documento';

@Component({
  selector: 'app-tipo-documento',
  templateUrl: './tipo-documento.component.html',
  styleUrls: ['./tipo-documento.component.css']
})
export class TipoDocumentoComponent implements OnInit {
  
  public tipoDocumento: TipoDocumento;
  @ViewChild('lstTipoDocumento') lstTipoDocumento: ListaTipoDocumentoComponent;

  constructor() {
    this.tipoDocumento = { tipo_documento: null, descripcion: null, abreviatura: null }
  }

  ngOnInit(): void {
  }

  setTipoDocumento = (td: TipoDocumento) => this.tipoDocumento = td;

  refreshTipoDocumentoList = () => this.lstTipoDocumento.loadTiposDocumento();

}
