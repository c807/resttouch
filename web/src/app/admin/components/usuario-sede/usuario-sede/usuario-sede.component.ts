import { Component, OnInit, ViewChild } from '@angular/core';

import { UsuarioSedeListaComponent } from '@admin-components/usuario-sede/usuario-sede-lista/usuario-sede-lista.component';
import { UsuarioSedeFormComponent } from '@admin-components/usuario-sede/usuario-sede-form/usuario-sede-form.component';
import { Usuario } from '@admin-interfaces/usuario';

@Component({
  selector: 'app-usuario-sede',
  templateUrl: './usuario-sede.component.html',
  styleUrls: ['./usuario-sede.component.css']
})
export class UsuarioSedeComponent implements OnInit {

  public usuario: Usuario;

	@ViewChild('lstUsuario') lstUsuarioComponent: UsuarioSedeListaComponent;
	@ViewChild('frmUsuarioSede') frmUsuarioSede: UsuarioSedeFormComponent;

	constructor() {
		this.usuario = {
			usuario: null, nombres: null, apellidos: null 
		};
	}

  ngOnInit() {
  }

  setUsuario = (usr: Usuario) => {
		this.usuario = usr;
		this.frmUsuarioSede.loadAccesos(+this.usuario.usuario);
		this.frmUsuarioSede.resetAcceso();
  }
  
	refreshUsuarioList = () => this.lstUsuarioComponent.loadUsuario();

}
