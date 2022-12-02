import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { GLOBAL, PaginarArray, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';

import { UsuarioTipo } from '../../../interfaces/usuario-tipo';
import { TipoUsuarioService } from '../../../services/tipo-usuario.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'app-lista-tipo-usuario',
	templateUrl: './lista-tipo-usuario.component.html',
	styleUrls: ['./lista-tipo-usuario.component.css']
})

export class ListaTipoUsuarioComponent implements OnInit, OnDestroy {

	public lstUsuarioTipo: UsuarioTipo[];
	public lstUsuarioTipoPaged: UsuarioTipo[];
	@Output() getTipoUsuarioEv = new EventEmitter();
	@ViewChild('paginador') paginador: MatPaginator;

	public length = 0;
	public pageSize = 5;
	public pageSizeOptions: number[] = [5, 10, 15];
	public pageIndex = 0;
	public pageEvent: PageEvent;
	public txtFiltro = '';
	public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
	public esMovil = false;

	private endSubs = new Subscription();

	constructor(
		private tipoUsuarioSrvc: TipoUsuarioService,
		private ls: LocalstorageService
	) { }

	ngOnInit() {
		this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
		this.loadTipoUsuario();
	}

	ngOnDestroy(): void {
		this.endSubs.unsubscribe();
	}

	applyFilter(cambioPagina = false) {
		if (this.txtFiltro.length > 0) {
			const tmpList = MultiFiltro(this.lstUsuarioTipo, this.txtFiltro);
			this.length = tmpList.length;
			this.lstUsuarioTipoPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
		} else {
			this.length = this.lstUsuarioTipo.length;
			this.lstUsuarioTipoPaged = PaginarArray(this.lstUsuarioTipo, this.pageSize, this.pageIndex + 1);
		}
		if (!cambioPagina) {
			this.paginador.firstPage();
		}
	}

	loadTipoUsuario = () => {
		this.endSubs.add(			
			this.tipoUsuarioSrvc.get().subscribe(lst => {
				if (lst) {
					if (lst.length > 0) {
						this.lstUsuarioTipo = lst;
						this.applyFilter();
					}
				}
			})
		);
	}

	getTipoUsuario = (obj: UsuarioTipo) => {
		this.getTipoUsuarioEv.emit(obj);
	}

	pageChange = (e: PageEvent) => {
		this.pageSize = e.pageSize;
		this.pageIndex = e.pageIndex;
		this.applyFilter(true);
	}
}
