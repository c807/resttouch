import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { DocumentoTipo } from '@admin-interfaces/documento-tipo';
import { DocumentoTipoService } from '@admin-services/documento-tipo.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-documento-tipo',
  templateUrl: './form-documento-tipo.component.html',
  styleUrls: ['./form-documento-tipo.component.css']
})
export class FormDocumentoTipoComponent implements OnInit, OnDestroy {

  @Input() documentoTipo: DocumentoTipo;
  @Output() documentoTipoSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private documentoTipoSrvc: DocumentoTipoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetDocumentoTipo() {
    this.documentoTipo = { documento_tipo: null, descripcion: null, codigo: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.documentoTipoSrvc.save(this.documentoTipo).subscribe((res) => {
        if (res) {
          this.resetDocumentoTipo();
          this.documentoTipoSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tipo de documento', { duration: 5000 });
        }
      })
    );
  }

}
