import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { ListaCorporacionComponent } from '@admin-components/corporacion/lista-corporacion/lista-corporacion.component';
import { ListaEmpresaComponent } from '@admin-components/empresa/lista-empresa/lista-empresa.component';
import { ListaSedeComponent } from '@admin-components/sede/lista-sede/lista-sede.component';
import { Corporacion, Empresa, Sede } from '@admin-interfaces/sede';

@Component({
  selector: 'app-corporacion',
  templateUrl: './corporacion.component.html',
  styleUrls: ['./corporacion.component.css']
})
export class CorporacionComponent implements OnInit {

  public corporacion: Corporacion;
  public empresa: Empresa;
  public sede: Sede;

  @ViewChild('lstCorporacion') lstCorporacionComponent: ListaCorporacionComponent;
  @ViewChild('lstEmpresa') lstEmpresaComponent: ListaEmpresaComponent;
  @ViewChild('lstSede') lstSedeComponent: ListaSedeComponent;

  constructor() { }

  ngOnInit() {
    this.corporacion = { corporacion: null, admin_llave: null, nombre: null };
    this.resetEmpresa();
    this.resetSede();
  }

  resetEmpresa = () => this.empresa = {
    empresa: null,
    corporacion: null,
    nombre: null,
    numero_acceso: null,
    afiliacion_iva: null,
    codigo_establecimiento: null,
    correo_emisor: null,
    nit: null,
    nombre_comercial: null,
    direccion: null,
    codigo_postal: null,
    municipio: null,
    departamento: null,
    pais_iso_dos: null,
    agente_retenedor: 0,
    porcentaje_iva: 0.00,
    visa_merchant_id: null,
    visa_transaction_key: null,
    codigo: null,
    metodo_costeo: 1
  }

  resetSede = () => this.sede = {
    sede: null,
    empresa: null,
    sede_padre: null,
    nombre: null,
    certificador_fel: null,
    fel_establecimiento: null,
    direccion: null,
    telefono: null,
    correo: null,
    codigo: null,
    cuenta_contable: null
  }

  onTabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    if (tabChangeEvent.index === 1) {
      this.lstEmpresaComponent.getEmpresas();

    } else if( tabChangeEvent.index === 2) {
      this.lstSedeComponent.getSedes();
    }
  }

  setFormCorporacion = (cli: Corporacion) => {
    this.corporacion = cli;
  }

  setFormEmpresa = (cli: Empresa) => {
    this.empresa = cli;
  }

  refreshEmpresaList = () => {
    this.lstEmpresaComponent.getEmpresas();
    this.resetEmpresa();
  }

  refreshCorporacionList = () => {
    this.lstCorporacionComponent.getCorporaciones();
    this.corporacion = {
      corporacion: null, admin_llave: null, nombre: null
    }
  }

  setFormSede = (cli: Sede) => this.sede = cli;
  refreshSedeList = () => this.lstSedeComponent.getSedes();

}
