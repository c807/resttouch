import { Component, OnInit, ViewChild } from '@angular/core';
import { ListaUsuarioComponent } from '../lista-usuario/lista-usuario.component';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  public usuario: Usuario;
  @ViewChild('lstUsuarioComponent', { static: false }) lstUsuarioComponent: ListaUsuarioComponent;

  constructor() {
    this.usuario = new Usuario(null, null, null, null, null, null, 0, 0);
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
