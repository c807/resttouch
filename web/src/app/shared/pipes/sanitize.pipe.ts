import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'sanitize'
})
export class SanitizePipe implements PipeTransform {

  constructor(private saniDom: DomSanitizer) { }

  transform(value: string): unknown {
    return this.saniDom.bypassSecurityTrustHtml(value);
  }

}
