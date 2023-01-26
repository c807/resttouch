import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaCertificadorConfiguracionComponent } from '@admin-components/certificador/configuracion/lista-certificador-configuracion/lista-certificador-configuracion.component';
import { FormCertificadorConfiguracionComponent } from '@admin-components/certificador/configuracion/form-certificador-configuracion/form-certificador-configuracion.component';
import { Configuracion } from '@admin-interfaces/certificador';

@Component({
  selector: 'app-certificador-configuracion',
  templateUrl: './certificador-configuracion.component.html',
  styleUrls: ['./certificador-configuracion.component.css']
})
export class CertificadorConfiguracionComponent implements OnInit {

  public certificador: Configuracion;
  @ViewChild('lstCertificador') lstCertificadorComponent: ListaCertificadorConfiguracionComponent;
	@ViewChild('frmCertificador') frmCertificador: FormCertificadorConfiguracionComponent;

	constructor() {
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

  ngOnInit() {
  }

  setCertificador = (conf: Configuracion) => {
		this.certificador = conf;
  }
  
	refreshCertificadorList = () => this.lstCertificadorComponent.loadCertificador();

}
