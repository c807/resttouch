import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoDocumento } from '@admin-interfaces/tipo-documento';
import { TipoDocumentoService } from '@admin-services/tipo-documento.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tipo-documento',
  templateUrl: './form-tipo-documento.component.html',
  styleUrls: ['./form-tipo-documento.component.css']
})
export class FormTipoDocumentoComponent implements OnInit, OnDestroy {

  @Input() tipoDocumento: TipoDocumento;
  @Output() tipoDocumentoSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private tipoDocumentoSrvc: TipoDocumentoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();    
  }

  resetTipoDocumento() {
    this.tipoDocumento = { tipo_documento: null, descripcion: null, abreviatura: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.tipoDocumentoSrvc.save(this.tipoDocumento).subscribe((res) => {
        if (res) {
          this.resetTipoDocumento();
          this.tipoDocumentoSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tipo de documento', { duration: 5000 });
        }
      })
    );
  }

}
