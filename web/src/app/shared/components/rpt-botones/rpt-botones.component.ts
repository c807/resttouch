import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { ConfiguracionBotones } from '../../interfaces/config-reportes';

@Component({
  selector: 'app-rpt-botones',
  templateUrl: './rpt-botones.component.html',
  styleUrls: ['./rpt-botones.component.css']
})
export class RptBotonesComponent implements OnInit {

  @Output() htmlClick = new EventEmitter();
  @Output() pdfClick = new EventEmitter();
  @Output() excelClick = new EventEmitter();
  @Output() imprimirClick = new EventEmitter();
  @Output() resetParamsClick = new EventEmitter();

  @Input() configuracion: ConfiguracionBotones = {
    isHtmlDisabled: false, isPdfDisabled: false, isExcelDisabled: false, isImprimirDisabled: false,
    showHtml: true, showPdf: true, showExcel: true, showImprimir: true
  };

  constructor() { }

  ngOnInit() {
  }

  onHtmlClick = () => this.htmlClick.emit();
  onPdfClick =  () => this.pdfClick.emit();
  onExcelClick = () => this.excelClick.emit();
  onImprimirClick = () => this.imprimirClick.emit();
  onResetParamsClick = () => this.resetParamsClick.emit();
}
