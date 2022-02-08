import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalstorageService } from '../../services/localstorage.service';
import { GLOBAL } from '../../../shared/global';
import { UsuarioService } from '../../services/usuario.service';
import { AppMenuService } from '../../services/app-menu.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DesktopNotificationService } from '../../../shared/services/desktop-notification.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  public appMenu: any[];

  constructor(
    private router: Router,
    private ls: LocalstorageService,
    private snackBar: MatSnackBar,
    private usrSrvc: UsuarioService,
    private appMenuSrvc: AppMenuService,
    private dns: DesktopNotificationService
  ) { }

  ngOnInit() {
    this.dns.havePermission().then((res) => {
      if (!res) {
        this.dns.requestPermission();
      }
    });
  }

  ngAfterViewInit(): void {
    Promise.resolve(null).then(() => {
      const usrAppMenu = this.usrSrvc.getAppMenu()
      this.appMenuSrvc.updData(usrAppMenu);
      this.appMenu = usrAppMenu;
      const lastModule: string = this.ls.get(GLOBAL.usrLastModuleVar);
      if (lastModule) {
        this.handleClick(lastModule);
      }
    });
  }  

  handleClick = (modulo: string = '') => {
    this.ls.set(GLOBAL.usrLastModuleVar, modulo);
    const objModulo: any = this.appMenu.find(m => m.nombre === modulo);
    // console.log(objModulo);
    if (objModulo) {
      const submodulo: any = this.usrSrvc.transformSubModule(objModulo.submodulo);
      // console.log(submodulo);
      this.appMenuSrvc.updOpciones(submodulo);
      this.snackBar.open(`Cambio al módulo ${modulo}`, 'Módulo', { duration: 5000 });
    }
  }

  LogOut() {
    this.ls.clear('ng2Idle.main.expiry');
    this.ls.clear('ng2Idle.main.idling');
    this.ls.clear(GLOBAL.usrTokenVar);
    this.ls.clear(GLOBAL.usrUnlockVar);
    this.ls.clear(GLOBAL.usrLastModuleVar);
    this.router.navigate(['/admin/login']);
  }

}
