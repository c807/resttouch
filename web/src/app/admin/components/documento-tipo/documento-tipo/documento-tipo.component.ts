import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaDocumentoTipoComponent } from '@admin-components/documento-tipo/lista-documento-tipo/lista-documento-tipo.component';
import { DocumentoTipo } from '@admin-interfaces/documento-tipo';

@Component({
  selector: 'app-documento-tipo',
  templateUrl: './documento-tipo.component.html',
  styleUrls: ['./documento-tipo.component.css']
})
export class DocumentoTipoComponent implements OnInit {

  public documentoTipo: DocumentoTipo;
  @ViewChild('lstDocumentoTipo') lstDocumentoTipo: ListaDocumentoTipoComponent;

  constructor() {
    this.documentoTipo = { documento_tipo: null, descripcion: null, codigo: null };
  }

  ngOnInit(): void {
  }

  setDocumentoTipo = (tcv: DocumentoTipo) => this.documentoTipo = tcv;

  refreshDocumentoTipoList = () => this.lstDocumentoTipo.loadDocumentosTipo();

}
