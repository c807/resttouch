import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ClienteMaster } from '@callcenter-interfaces/cliente-master';
import { ClienteMasterService } from '@callcenter-services/cliente-master.service';
import { TipoDocumento } from '@admin-interfaces/tipo-documento';
import { TipoDocumentoService } from '@admin-services/tipo-documento.service'

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-cliente-master',
  templateUrl: './form-cliente-master.component.html',
  styleUrls: ['./form-cliente-master.component.css']
})
export class FormClienteMasterComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
  @Output() clienteMasterSvd = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public cargando = false;
  public tiposDocumento: TipoDocumento[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private clienteMasterSrvc: ClienteMasterService,
    private tipoDocumentoSrvc: TipoDocumentoService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.loadTiposDocumento();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadTiposDocumento = () => {
    this.endSubs.add(
      this.tipoDocumentoSrvc.get().subscribe(res => this.tiposDocumento = res)
    );
  }

  onSubmit = () => {
    if (this.clienteMaster.correo && this.clienteMaster.correo.length > 0) {
      if (this.clienteMaster.correo.match(GLOBAL.FORMATO_EMAIL)) {
        this.guardarCliente();
      } else {
        this.snackBar.open(`El correo '${this.clienteMaster.correo}' no es válido.`, 'Cliente', { duration: 3000 });
      }
    } else {
      this.guardarCliente();
    }
  }

  guardarCliente = () => {
    this.endSubs.add(
      this.clienteMasterSrvc.save(this.clienteMaster).subscribe(res => {
        if (res.exito) {
          this.clienteMaster = res.cliente_master;
          this.clienteMasterSvd.emit(this.clienteMaster);
          this.snackBar.open(res.mensaje, 'Cliente', { duration: 5000 });
        } else {
          this.snackBar.open(`ERROR:${res.mensaje}`, 'Cliente', { duration: 7000 });
        }
      })
    );
  }

  validateKey = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[a-zA-Z0-9]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

}
