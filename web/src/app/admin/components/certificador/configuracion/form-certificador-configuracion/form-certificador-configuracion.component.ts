import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Configuracion } from '@admin-interfaces/certificador';
import { CertificadorService } from '@admin-services/certificador.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-certificador-configuracion',
  templateUrl: './form-certificador-configuracion.component.html',
  styleUrls: ['./form-certificador-configuracion.component.css']
})
export class FormCertificadorConfiguracionComponent implements OnInit, OnDestroy {

  @Input() certificador: Configuracion;
  @Output() certificadorSavedEv = new EventEmitter();

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private certificadorSrvc: CertificadorService
  ) { }

  ngOnInit() {
    this.resetCertificador();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetCertificador = () => {
    this.certificador = {
      certificador_configuracion: null,
      nombre: null,
      vinculo_factura: null,
      vinculo_firma: null,
      metodo_factura: null,
      vinculo_anulacion: null,
      metodo_anulacion: null,
      vinculo_grafo: null,
      metodo_grafo: null
    };
  }

  onSubmit = () => {
    this.endSubs.add(      
      this.certificadorSrvc.saveConfig(this.certificador).subscribe(res => {
        if (res.exito) {
          this.certificadorSavedEv.emit();
          this.resetCertificador();
          this.snackBar.open('Certificador guardado con éxito...', 'Certificador', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Sede Usuario', { duration: 3000 });
        }
      })
    );
  }

}
