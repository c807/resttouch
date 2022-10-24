import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { TableroService } from '../../../services/tablero.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-metabase-dashboard',
  templateUrl: './metabase-dashboard.component.html',
  styleUrls: ['./metabase-dashboard.component.css']
})
export class MetabaseDashboardComponent implements OnInit, OnDestroy {

  public iframeUrl: SafeResourceUrl;

  private endSubs = new Subscription();

  constructor(
    private sanitizer: DomSanitizer,
    private tableroSrvc: TableroService
  ) { }

  ngOnInit(): void {
    this.getMetabaseURL();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();    
  }

  getMetabaseURL = () => {

    const params = {
      tipo: 'dashboard',
      payload: {
        resource: {
          dashboard: 1
        },
        params: {},
        exp: Math.round(Date.now() / 1000) + (10 * 60)
      }
    }

    this.endSubs.add(
      this.tableroSrvc.getMetabaseURL(params).subscribe(res => {
        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
      })
    );
  }

}
