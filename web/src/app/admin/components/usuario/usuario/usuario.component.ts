import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaUsuarioComponent } from '@admin-components/usuario/lista-usuario/lista-usuario.component';
import { FormUsuarioComponent } from '@admin-components/usuario/form-usuario/form-usuario.component';
import { Usuario } from '@admin-models/usuario';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  public usuario: Usuario;
  @ViewChild('lstUsuarioComponent') lstUsuarioComponent: ListaUsuarioComponent;
  @ViewChild('frmUsuarioComponent') frmUsuarioComponent: FormUsuarioComponent;

  constructor() {
    this.usuario = new Usuario(null, null, null, null, null, null, 0, 0, null, 0, 0, 0, null, 0);
  }

  ngOnInit() {
  }

  setUsuario(usr: Usuario) {
    this.usuario = usr;
    if (+usr.confirmar_ingreso === 1 || +usr.confirmar_egreso === 1) {
      this.frmUsuarioComponent.loadBodegas();
      this.frmUsuarioComponent.loadBodegasUsuario(+usr.usuario);
    } else {
      this.frmUsuarioComponent.bodegasUsuario = [];
    }
  }

  refreshUserList() {
    this.lstUsuarioComponent.loadUsuarios();
  }

}
