import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { PaginarArray, MultiFiltro } from '@shared/global';

import { Configuracion } from '@admin-interfaces/certificador';
import { CertificadorService } from '@admin-services/certificador.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'app-lista-certificador-configuracion',
	templateUrl: './lista-certificador-configuracion.component.html',
	styleUrls: ['./lista-certificador-configuracion.component.css']
})
export class ListaCertificadorConfiguracionComponent implements OnInit, OnDestroy {

	public lstCertificador: Configuracion[];
	public lstCertificadorPaged: Configuracion[];
	@Output() getCertificadorEv = new EventEmitter();
	@ViewChild('paginador') paginador: MatPaginator;

	public length = 0;
	public pageSize = 5;
	public pageSizeOptions: number[] = [5, 10, 15];
	public pageIndex = 0;
	public pageEvent: PageEvent;
	public txtFiltro = '';

	private endSubs = new Subscription();

	constructor(private CertificadorSrvc: CertificadorService) { }

	ngOnInit() {
		this.loadCertificador();
	}

	ngOnDestroy(): void {
		this.endSubs.unsubscribe();
	}

	applyFilter(cambioPagina = false) {
		if (this.txtFiltro.length > 0) {
			const tmpList = MultiFiltro(this.lstCertificador, this.txtFiltro);
			this.length = tmpList.length;
			this.lstCertificadorPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
		} else {
			this.length = this.lstCertificador.length;
			this.lstCertificadorPaged = PaginarArray(this.lstCertificador, this.pageSize, this.pageIndex + 1);
		}
		if (!cambioPagina) {
			this.paginador.firstPage();
		}
	}

	loadCertificador = () => {
		this.endSubs.add(			
			this.CertificadorSrvc.getConfig().subscribe(lst => {
				if (lst) {
					if (lst.length > 0) {
						this.lstCertificador = lst;
						this.applyFilter();
					}
				}
			})
		);
	}

	getCertificador = (obj: Configuracion) => {
		this.getCertificadorEv.emit(obj);
	}

	pageChange = (e: PageEvent) => {
		this.pageSize = e.pageSize;
		this.pageIndex = e.pageIndex;
		this.applyFilter(true);
	}

}
