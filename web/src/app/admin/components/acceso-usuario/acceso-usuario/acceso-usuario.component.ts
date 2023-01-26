import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { ListaAccesoUsuarioComponent } from '@admin-components/acceso-usuario/lista-acceso-usuario/lista-acceso-usuario.component';
import { FormAccesoUsuarioComponent } from '@admin-components/acceso-usuario/form-acceso-usuario/form-acceso-usuario.component';
import { Usuario } from '@admin-interfaces/usuario';

@Component({
  selector: 'app-acceso-usuario',
  templateUrl: './acceso-usuario.component.html',
  styleUrls: ['./acceso-usuario.component.css']
})
export class AccesoUsuarioComponent implements OnInit {

	public usuario: Usuario;

	@ViewChild('lstUsuario') lstUsuarioComponent: ListaAccesoUsuarioComponent;
	@ViewChild('frmAccesoUsuario') frmAccesoUsuario: FormAccesoUsuarioComponent;

	constructor(
		private ls: LocalstorageService
	) {
		this.usuario = {
			usuario: null, nombres: null, apellidos: null 
		};
	}

	ngOnInit() {
	}

	setUsuario = (usr: Usuario) => {
		this.usuario = usr;
		this.frmAccesoUsuario.loadAccesos(+this.usuario.usuario);
		this.frmAccesoUsuario.resetAcceso();
	}
	refreshUsuarioList = () => this.lstUsuarioComponent.loadUsuario();
}
