import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaRolComponent } from '@admin-components/rol/lista-rol/lista-rol.component';
import { FormRolComponent } from '@admin-components/rol/form-rol/form-rol.component';
import { Rol } from '@admin-interfaces/rol';

@Component({
  selector: 'app-rol',
  templateUrl: './rol.component.html',
  styleUrls: ['./rol.component.css']
})
export class RolComponent implements OnInit {

  public rol: Rol;
  @ViewChild('lstRol') lstRol: ListaRolComponent;
  @ViewChild('frmRol') frmRol: FormRolComponent;

  constructor() {
    this.rol = { rol: null, descripcion: null };
  }

  ngOnInit(): void {
  }

  setRol = (tc: Rol) => {
    this.rol = tc
    this.frmRol.resetRol();
    this.frmRol.rol = this.rol;
    this.frmRol.loadDetalleRol(+this.rol.rol);
  };

  refreshRolList = () => this.lstRol.loadRoles();

}
