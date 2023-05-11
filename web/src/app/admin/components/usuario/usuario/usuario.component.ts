import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaUsuarioComponent } from '@admin-components/usuario/lista-usuario/lista-usuario.component';
import { Usuario } from '@admin-models/usuario';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  public usuario: Usuario;
  @ViewChild('lstUsuarioComponent') lstUsuarioComponent: ListaUsuarioComponent;

  constructor() {
    this.usuario = new Usuario(null, null, null, null, null, null, 0, 0, null, 0, 0, 0, null);
  }

  ngOnInit() {
  }

  setUsuario(usr: Usuario) {
    this.usuario = usr;
  }

  refreshUserList() {
    this.lstUsuarioComponent.loadUsuarios();
  }

}
