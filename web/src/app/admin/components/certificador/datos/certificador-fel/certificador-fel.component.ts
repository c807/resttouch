import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaCertificadorConfiguracionComponent } from '@admin-components/certificador/configuracion/lista-certificador-configuracion/lista-certificador-configuracion.component';
import { FormCertificadorFelComponent } from '@admin-components/certificador/datos/form-certificador-fel/form-certificador-fel.component';
import { Configuracion } from '@admin-interfaces/certificador';

@Component({
  selector: 'app-certificador-fel',
  templateUrl: './certificador-fel.component.html',
  styleUrls: ['./certificador-fel.component.css']
})
export class CertificadorFelComponent implements OnInit {

  public certificador: Configuracion;

  @ViewChild('lstCertificador') lstCertificadorComponent: ListaCertificadorConfiguracionComponent;
  @ViewChild('frmCertificador') frmCertificador: FormCertificadorFelComponent;

  constructor() { }

  ngOnInit() {
    this.certificador = {
      certificador_configuracion: null,
      nombre: null,
      vinculo_factura: null,
      vinculo_firma: null,
      metodo_factura: null,
      vinculo_anulacion: null,
      metodo_anulacion: null,
      vinculo_grafo: null,
      metodo_grafo: null
    };
  }

  setCertificador = (usr: Configuracion) => {
    this.certificador = usr;
    this.frmCertificador.loadCertificadores(+this.certificador.certificador_configuracion);
    this.frmCertificador.resetCertificador();
  }

  refreshCertificadorList = () => this.lstCertificadorComponent.loadCertificador();

}
