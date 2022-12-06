import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { NotaPredefinida } from '../../../interfaces/nota-predefinida';
import { NotaPredefinidaService } from '../../../services/nota-predefinida.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-nota-predefinida',
  templateUrl: './form-nota-predefinida.component.html',
  styleUrls: ['./form-nota-predefinida.component.css']
})
export class FormNotaPredefinidaComponent implements OnInit, OnDestroy {

  @Input() notaPredefinida: NotaPredefinida;
  @Output() notaPredefinidaSavedEv = new EventEmitter();  
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private notaPredefinidaSrvc: NotaPredefinidaService,
    private ls: LocalstorageService    
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();    
  }

  resetNotaPredefinida() {
    this.notaPredefinida = { nota_predefinida: null, nota: null };    
  }

  onSubmit() {
    this.endSubs.add(      
      this.notaPredefinidaSrvc.save(this.notaPredefinida).subscribe((res) => {
        if (res) {
          this.resetNotaPredefinida();
          this.notaPredefinidaSavedEv.emit();
          this.snackBar.open('Grabada con éxito.', 'Nota predefinida', { duration: 5000 });
        }
      })
    );
  }

}
