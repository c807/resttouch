import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { ClienteMaster, ClienteMasterTelefono } from '../../../interfaces/cliente-master';
import { Telefono } from '../../../interfaces/telefono';
import { ClienteMasterService } from '../../../services/cliente-master.service';
import { SeleccionaTelefonoComponent } from '../selecciona-telefono/selecciona-telefono.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cliente-master-telefono',
  templateUrl: './cliente-master-telefono.component.html',
  styleUrls: ['./cliente-master-telefono.component.css']
})
export class ClienteMasterTelefonoComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
  public lstTelefonos: ClienteMasterTelefono[] = [];
  public telefono: Telefono;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public cargando = false;  

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private clienteMasterSrvc: ClienteMasterService,
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetTelefono();
    if (+this.clienteMaster.cliente_master > 0) {
      this.loadClienteMasterTelefonos();
    }    
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  validatePhone = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[0-9]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  resetTelefono = () => this.telefono = { telefono: null, numero: null };

  loadClienteMasterTelefonos = () => {
    this.cargando = true;
    this.endSubs.add(      
      this.clienteMasterSrvc.getTelefonosClienteMaster({ cliente_master: this.clienteMaster.cliente_master }).subscribe(res => {
        this.lstTelefonos = res;
        this.cargando = false;
      })
    );
  }

  checkTelefono = () => {
    this.cargando = true;
    const fltr = {
      _parecido: true,
      numero: this.telefono.numero
    }
    this.endSubs.add(
      this.clienteMasterSrvc.buscarTelefono(fltr).subscribe(res => {
        if (res.length === 1) {
          this.telefono = res[0];
          this.asociarTelefono();
        } else if (res.length > 1) {
          const selTelRef = this.dialog.open(SeleccionaTelefonoComponent, {
            disableClose: true,
            data: { clienteMaster: this.clienteMaster, telefonos: res }
          });
          this.endSubs.add(
            selTelRef.afterClosed().subscribe((seleccion: Telefono) => {
              if (seleccion) {
                this.telefono = seleccion;
                this.asociarTelefono();
              }
            })
          );
        } else {
          this.asociarTelefono();
        }
        this.cargando = false;
      })
    );
  }

  asociarTelefono = () => {
    this.cargando = true;
    const obj = {
      cliente_master: this.clienteMaster.cliente_master,
      numero: this.telefono.numero
    }
    this.endSubs.add(
      this.clienteMasterSrvc.saveTelefonosClienteMaster(obj).subscribe(res => {
        if (res.exito) {
          this.resetTelefono();
          this.loadClienteMasterTelefonos();
          this.snackBar.open(res.mensaje, 'Teléfonos asociados', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Teléfonos asociados', { duration: 7000 });
        }
        this.cargando = false;
      })
    );
  }

  desasociarTelefono = (tel: ClienteMasterTelefono) => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Desasociar teléfono',
        `Esto desasociará el teléfono ${tel.numero} de ${tel.nombre}. ¿Desea continuar?`,
        'Sí',
        'No'
      )
    });

    this.endSubs.add(      
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.cargando = true;
          this.endSubs.add(
            this.clienteMasterSrvc.desasociarTelefonoClienteMaster(+tel.cliente_master_telefono).subscribe(res => {
              this.loadClienteMasterTelefonos();
              this.snackBar.open(`${res.exito ? '': 'ERROR:'} ${res.mensaje}`, 'Teléfono', { duration: 5000 });
              this.cargando = false;
            })
          );
        }
      })
    );
  }

}
