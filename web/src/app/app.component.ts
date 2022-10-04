import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from './admin/services/localstorage.service';
import { GLOBAL, isAllowedUrl } from './shared/global';
import { UsuarioService } from './admin/services/usuario.service';
import { Router } from '@angular/router';
import { AccesoUsuario } from './admin/interfaces/acceso-usuario';
import { OnlineService } from './shared/services/online.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  @HostListener('window:keydown.F5', ['$event'])
  handleF5KeyDown(event: KeyboardEvent) {    
    event.preventDefault();
  }

  @ViewChild('sidenav') sidenav: any;

  title = 'Rest-Touch';
  isLogged: boolean = false;
  opened: boolean;

  public usrAppMenu: AccesoUsuario[] = [];

  private endSubs = new Subscription();

  constructor(
    private ls: LocalstorageService,
    private usrSrvc: UsuarioService,
    private router: Router,
    private onlineSrvc: OnlineService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    if (window.addEventListener) {
      this.ls.set('rt_openpages', Date.now(), false);
      window.addEventListener('storage', this.storageListener, false);
    }
    this.onlineSrvc.listenToOnlineStatus();
    await this.checkIfUserIsLogged();
  }

  ngOnDestroy(): void {    
    if (window.addEventListener) {
      window.removeEventListener('storage', this.storageListener, false);
    }
    this.endSubs.unsubscribe;
  }

  private goToLogin = () => {
    this.isLogged = false;

    this.ls.clear('ng2Idle.main.expiry');
    this.ls.clear('ng2Idle.main.idling');
    this.ls.clear(GLOBAL.usrTokenVar);
    this.ls.clear(GLOBAL.usrUnlockVar);
    this.ls.clear(GLOBAL.usrLastModuleVar);

    this.usrAppMenu = [];

    if (!isAllowedUrl(this.router.url)) {
      this.router.navigate(['/admin/login']);
    }
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

  storageListener = (e: StorageEvent) => {    
    if (e.key == 'rt_openpages') {
      // Listen if anybody else is opening the same page!
      this.ls.set('rt_page_available', Date.now(), false);
    }
    if (e.key == 'rt_page_available') {      
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px', disableClose: true,
        data: new ConfirmDialogModel(
          'Rest-Touch Pro',
          'Rest-Touch Pro ya está abierto en otra pestaña.',
          'Ok', null, null, true, true
        )
      });
  
      this.endSubs.add(
        dialogRef.afterClosed().subscribe(() => {
          window.location.href = 'https://posguatemala.com';          
        })
      );
    }
  }

}
