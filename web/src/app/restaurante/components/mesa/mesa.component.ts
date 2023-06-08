import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Mesa } from '@restaurante-interfaces/mesa';
import { MesaService } from '@restaurante-services/mesa.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.css']
})
export class MesaComponent implements OnInit, AfterViewInit, OnDestroy {

  get imagenMesa(): string {
    let img = '';

    if (+this.configuracion.esmostrador === 0) {
      if (+this.configuracion.eshabitacion === 0) {
        img = 'table_03.svg';
      } else {
        img = 'habitacion.png';
      }
    } else {
      if (+this.configuracion.escallcenter === 0) {
        if (+this.configuracion.vertical === 0) {
          img = 'mostrador_horizontal.svg';
        } else {
          img = 'mostrador_vertical.svg';
        }
      } else {
        img = 'callcenter.svg';
      }
    }
    return img;
  }

  @Input() configuracion: any = {
    mesa: 0,
    area: 0,
    numero: 0,
    posx: 0.0000,
    posy: 0.0000,
    tamanio: 48,
    estatus: 1,
    ancho: null,
    alto: null,
    esmostrador: 0,
    vertical: 0,
    etiqueta: null,
    escallcenter: 0,
    esreservable: 0,
    eshabitacion: 0
  };
  @Input() dontAllowDrag = true;
  @Input() isDisabled = false;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onClickMesa = new EventEmitter();
  @Output() moviendoMesa = new EventEmitter();
  @ViewChild('divMesa') divMesa: ElementRef;

  public objMesa: HTMLElement;
  public urlImage = '/assets/img/mesas/';

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private mesaSrvc: MesaService
  ) { }

  ngOnInit() {
    this.urlImage += this.imagenMesa;
    // console.log(this.configuracion, this.urlImage);
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  ngAfterViewInit = () => this.objMesa = this.divMesa.nativeElement;

  clickMesa = () => this.onClickMesa.emit({ mesaSelected: this.configuracion });

  getAncho = () => {
    if (this.configuracion.ancho && +this.configuracion.ancho > 0) {
      return this.configuracion.ancho;
    }
    return this.configuracion.tamanio;
  }

  getAlto = () => {
    if (this.configuracion.alto && +this.configuracion.alto > 0) {
      return this.configuracion.alto;
    }
    return this.configuracion.tamanio;
  }

  dragEnded = (obj: any) => {
    this.dontAllowDrag = true;
    // console.log('Drag ended = ', obj);
    const item = obj.source.element.nativeElement;
    // console.log('HTML ITEM: ', item);
    const parentSize = { x: item.offsetParent.scrollWidth, y: item.offsetParent.scrollHeight };
    // console.log('Parent Size = ', parentSize);
    const distancia = obj.distance;
    // console.log('Distancia = ', distancia);
    const updMesa: Mesa = {
      mesa: this.configuracion.mesa,
      area: this.configuracion.area,
      numero: this.configuracion.numero,
      posx: Math.abs((item.offsetLeft + distancia.x) * 100 / parentSize.x),
      posy: Math.abs((item.offsetTop + distancia.y) * 100 / parentSize.y),
      tamanio: this.configuracion.tamanio,
      estatus: this.configuracion.estatus
    };
    // console.log(updMesa);
    this.endSubs.add(
      this.mesaSrvc.save(updMesa).subscribe(res => {
        // console.log(res);
        if (res.exito) {
          if (!!res.mesa) {
            this.configuracion.mesa = res.mesa.mesa;
            const tipoMesa = +res.mesa.esmostrador === 0 ? (+res.mesa.eshabitacion === 0 ? 'Mesa' : 'Habitación') : 'Mostrador';
            this.snackBar.open(`${tipoMesa} #${res.mesa.numero} actualizada...`, 'Diseño de área', { duration: 3000 });
          } else {
            const tipoMesa = +this.configuracion.esmostrador === 0 ? (+this.configuracion.eshabitacion === 0 ? 'Mesa' : 'Habitación') : 'Mostrador';
            this.snackBar.open(`${tipoMesa} #${this.configuracion.numero} actualizada...`, 'Diseño de área', { duration: 3000 });
          }
        } else {
          this.snackBar.open(`ERROR:${res.mensaje}.`, 'Diseño de área', { duration: 3000 });
        }
        this.dontAllowDrag = false;
        this.moviendoMesa.emit(false);
      })
    );
  }

  dragStarted = (obj: any) => {
    this.moviendoMesa.emit(true);
  }
}
