import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ClienteMaster } from '@callcenter-interfaces/cliente-master';
import { ClienteMasterService } from '@callcenter-services/cliente-master.service';
import { ClienteMasterDialogComponent } from '@callcenter-components/cliente-master/cliente-master-dialog/cliente-master-dialog.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cliente-master',
  templateUrl: './cliente-master.component.html',
  styleUrls: ['./cliente-master.component.css']
})
export class ClienteMasterComponent implements OnInit, OnDestroy {

  private endSubs = new Subscription();
  public lstClienteMaster: ClienteMaster[] = [];
  public lstClienteMasterFiltered: ClienteMaster[] = [];
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public cargando = false;

  constructor(
    private clienteMasterSrvc: ClienteMasterService,
    private ls: LocalstorageService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadClientesMaster();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  applyFilter = () => {
    if (this.txtFiltro.length > 0) {
      this.lstClienteMasterFiltered = MultiFiltro(this.lstClienteMaster, this.txtFiltro);      
    } else {
      this.lstClienteMasterFiltered = JSON.parse(JSON.stringify(this.lstClienteMaster));
    }    
  }

  loadClientesMaster = () => {
    this.cargando = true;
    this.endSubs.add(
      this.clienteMasterSrvc.get().subscribe(res => {
        this.lstClienteMaster = res;
        this.lstClienteMasterFiltered = JSON.parse(JSON.stringify(this.lstClienteMaster));
        this.cargando = false;
      })
    );
  }

  addEditClienteMaster = (clienteMaster: ClienteMaster = null) => {    
    if (!clienteMaster) {
      clienteMaster = { cliente_master: null, nombre: null, correo: null, fecha_nacimiento: null, tipo_documento: null, numero_documento: null, enlistanegra: 0 };
    }

    const cmdRef = this.dialog.open(ClienteMasterDialogComponent, {
      maxWidth: '100vw', maxHeight: '85vh', width: '99vw', height: '85vh',
      disableClose: true,
      data: { clienteMaster }
    });

    this.endSubs.add(
      cmdRef.afterClosed().subscribe(() => {
        this.loadClientesMaster();
      })
    );

  }
}
