import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
	providedIn: 'root'
})
export class ReportesCallcenter {

	private srvcErrHndl: ServiceErrorHandler;	

	constructor(
		private http: HttpClient,
		) {
		this.srvcErrHndl = new ServiceErrorHandler();
	}

	generar_archivo_venta(fltr: any = {}) {

		const httpOptions = {
			headers: new HttpHeaders({
				Accept: 'application/pdf'
			}),
			responseType: 'blob' as 'json'
		};

		return this.http.post<string>(
			`${GLOBAL.urlCallCenter}/reporte/venta_callcenter/generar_archivo?${qs.stringify(fltr)}`,
			fltr,
			httpOptions
			).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));


	}

}
