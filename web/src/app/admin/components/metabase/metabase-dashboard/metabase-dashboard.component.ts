import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-metabase-dashboard',
  templateUrl: './metabase-dashboard.component.html',
  styleUrls: ['./metabase-dashboard.component.css']
})
export class MetabaseDashboardComponent implements OnInit {

  public iframeUrl: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getMetabaseURL();
  }

  getMetabaseURL = () => {    
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:3000/embed/dashboard/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjF9LCJwYXJhbXMiOnt9LCJleHAiOjE2NjYxNDQ2NjZ9.afERsSjn0lGg3NRrMXuCu_1O_vuxIjFEzy5dHV0spMQ#bordered=true&titled=true');
  }

}
