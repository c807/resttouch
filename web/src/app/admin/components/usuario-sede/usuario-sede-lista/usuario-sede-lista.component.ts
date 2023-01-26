import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { PaginarArray, MultiFiltro } from '@shared/global';

import { Usuario } from '@admin-interfaces/usuario';
import { UsuarioService } from '@admin-services/usuario.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuario-sede-lista',
  templateUrl: './usuario-sede-lista.component.html',
  styleUrls: ['./usuario-sede-lista.component.css']
})
export class UsuarioSedeListaComponent implements OnInit, OnDestroy {

  public lstUsuario: Usuario[];
	public lstUsuarioPaged: Usuario[];
	@Output() getUsuarioEv = new EventEmitter();
	@ViewChild('paginador') paginador: MatPaginator;

	public length = 0;
	public pageSize = 5;
	public pageSizeOptions: number[] = [5, 10, 15];
	public pageIndex = 0;
	public pageEvent: PageEvent;
	public txtFiltro = '';

	private endSubs = new Subscription();

	constructor(private UsuarioSrvc: UsuarioService) { }

  ngOnInit() {
	  this.loadUsuario();
  }

  ngOnDestroy(): void {
	this.endSubs.unsubscribe();
  }

  applyFilter(cambioPagina = false) {
		if (this.txtFiltro.length > 0) {
			const tmpList = MultiFiltro(this.lstUsuario, this.txtFiltro);
			this.length = tmpList.length;
			this.lstUsuarioPaged = PaginarArray(tmpList, this.pageSize, this.pageIndex + 1);
		} else {
			this.length = this.lstUsuario.length;
			this.lstUsuarioPaged = PaginarArray(this.lstUsuario, this.pageSize, this.pageIndex + 1);
		}
		if (!cambioPagina) {
			this.paginador.firstPage();
		}
	}

	loadUsuario = () => {
		this.endSubs.add(			
			this.UsuarioSrvc.getAll().subscribe(lst => {
				if (lst) {
					if (lst.length > 0) {
						this.lstUsuario = lst;
						this.applyFilter();
					}
				}
			})
		);
	}

	getUsuario = (obj: Usuario) => {
		this.getUsuarioEv.emit(obj);
	}

	pageChange = (e: PageEvent) => {
		this.pageSize = e.pageSize;
		this.pageIndex = e.pageIndex;
		this.applyFilter(true);
	}
}
