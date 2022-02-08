import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalstorageService } from './admin/services/localstorage.service';
import { GLOBAL } from './shared/global';
import { UsuarioService } from './admin/services/usuario.service';
import { Router } from '@angular/router';
import { AccesoUsuario } from './admin/interfaces/acceso-usuario';
import { OnlineService } from './shared/services/online.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  @ViewChild('sidenav') sidenav: any;

  title = 'Rest-Touch';
  isLogged: boolean = false;
  opened: boolean;

  public usrAppMenu: AccesoUsuario[] = [];

  constructor(
    private ls: LocalstorageService,
    private usrSrvc: UsuarioService,
    private router: Router,
    // private appMenuSrvc: AppMenuService,
    private onlineSrvc: OnlineService
  ) { }

  async ngOnInit() {
    this.onlineSrvc.listenToOnlineStatus();
    await this.checkIfUserIsLogged();
  }

  private goToLogin = () => {
    this.isLogged = false;

    this.ls.clear('ng2Idle.main.expiry');
    this.ls.clear('ng2Idle.main.idling');
    this.ls.clear(GLOBAL.usrTokenVar);
    this.ls.clear(GLOBAL.usrUnlockVar);
    this.ls.clear(GLOBAL.usrLastModuleVar);

    this.usrAppMenu = [];
    this.router.navigate(['/admin/login']);        
  }

  async checkIfUserIsLogged() {
    const usrData = this.ls.get(GLOBAL.usrTokenVar);
    if (usrData) {
      if (usrData.token) {
        const valido = await this.usrSrvc.checkUserToken();
        if (valido) {          
          this.isLogged = true;          
        } else {
          this.goToLogin();
        }
      } else {
        this.goToLogin();
      }
    } else {
      this.goToLogin();
    }
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

}
