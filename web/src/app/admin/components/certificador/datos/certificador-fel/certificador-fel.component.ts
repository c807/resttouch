import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaCertificadorConfiguracionComponent } from '../../configuracion/lista-certificador-configuracion/lista-certificador-configuracion.component';
import { FormCertificadorFelComponent } from '../form-certificador-fel/form-certificador-fel.component';
import { Configuracion } from '../../../../interfaces/certificador';

@Component({
  selector: 'app-certificador-fel',
  templateUrl: './certificador-fel.component.html',
  styleUrls: ['./certificador-fel.component.css']
})
export class CertificadorFelComponent implements OnInit {

  public certificador: Configuracion;

	@ViewChild('lstCertificador', { static: false }) lstCertificadorComponent: ListaCertificadorConfiguracionComponent;
	@ViewChild('frmCertificador', { static: false }) frmCertificador: FormCertificadorFelComponent;

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
  
	refreshUsuarioList = () => this.lstCertificadorComponent.loadCertificador();

}
