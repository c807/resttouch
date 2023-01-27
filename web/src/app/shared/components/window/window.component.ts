import { Component, OnInit, ViewChild, ComponentFactoryResolver, ApplicationRef, Injector, OnDestroy, Input } from '@angular/core';
import { CdkPortal, DomPortalHost } from '@angular/cdk/portal';
import { WindowConfiguration } from '@shared-interfaces/window-configuration';

@Component({
  selector: 'app-window',
  template: `
    <ng-container *cdkPortal>
      <ng-content></ng-content>
    </ng-container>
  `
})
export class WindowComponent implements OnInit, OnDestroy {

  // STEP 1: get a reference to the portal
  @ViewChild(CdkPortal, { static: true }) portal: CdkPortal;
  @Input() windowConfig: WindowConfiguration = { 
    width: 600, height: 400, left: 200, top: 200, menubar: 'no', resizable: 'no', titlebar: 'no', toolbar: 'no'
  };

  // STEP 2: save a reference to the window so we can close it
  private externalWindow = null;

  // STEP 3: Inject all the required dependencies for a PortalHost
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector) { }


  ngOnInit() {
    // STEP 4: create an external window
    this.externalWindow = window.open('', '', `
    width=${this.windowConfig.width}, 
    height=${this.windowConfig.height},
    left=${this.windowConfig.left},
    top=${this.windowConfig.top},
    menubar=${this.windowConfig.menubar},
    resizable=${this.windowConfig.resizable},
    titlebar=${this.windowConfig.titlebar},
    toolbar=${this.windowConfig.toolbar}
    `);

    // STEP 5: create a PortalHost with the body of the new window document    
    const host = new DomPortalHost(
      this.externalWindow.document.body,
      this.componentFactoryResolver,
      this.applicationRef,
      this.injector
    );

    // STEP 6: Attach the portal
    host.attach(this.portal);
  }

  ngOnDestroy() {
    // STEP 7: close the window when this component destroyed
    this.externalWindow.close()
  }


}
