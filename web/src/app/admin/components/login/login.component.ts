import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { usrLogin, Usuario, usrLogInResponse } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { LocalstorageService } from '../../services/localstorage.service';
import { GLOBAL, isAllowedUrl } from '../../../shared/global';
import { OnlineService } from '../../../shared/services/online.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  get isOnline() {
    return this.onlineSrvc.isOnline$.value;
  }

  public usr: usrLogin;
  public usuario: Usuario;

  constructor(
    private usrSrvc: UsuarioService,
    private ls: LocalstorageService,
    private router: Router,
    private snackBar: MatSnackBar,
    private onlineSrvc: OnlineService
  ) {
    this.usr = new usrLogin(null, null);
    this.usuario = new Usuario(null, null, null, null, null, null, 0, null, 0, 0);
  }

  ngOnInit() {
    if(!isAllowedUrl(this.router.url)) {
      this.checkIfLogged();
    }
  }

  checkIfLogged = async () => {
    const valido = await this.usrSrvc.checkUserToken();
    if (valido) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/admin/login']);
    }
  }

  esMovil = (usavk: number = 0): boolean => {
    let estoyEnMovil = usavk === 0 ? true : false;
    // estoyEnMovil = true; // Solo para desarrollo
    const ua = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      estoyEnMovil = true;
    }
    return estoyEnMovil;
  }

  doLogin() {
    this.usrSrvc.login(this.usr).subscribe((res: usrLogInResponse) => {
      if (res.token) {
        this.ls.set(GLOBAL.usrTokenVar, {
          token: res.token, usuario: res.usrname, nombres: res.nombres, apellidos: res.apellidos, sede: +res.sede,
          idusr: +res.idusr, enmovil: this.esMovil(+res.usatecladovirtual), acceso: res.acceso, sede_uuid: res.sede_uuid,
          empresa: res.empresa, restaurante: res.restaurante, configuracion: [], usatecladovirtual: res.usatecladovirtual, dominio: res.dominio,
          wms: res.wms
        });
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.snackBar.open(res.mensaje, 'Login', { duration: 7000 });
      }
    }, (error) => {
      console.log(error);
    });
  }

  registrarse = () => {
    this.router.navigate(['/admin/solicitud_registro']);
  }
}
