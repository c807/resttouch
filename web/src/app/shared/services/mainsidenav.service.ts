import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MainSidenavService {
    private sidenavState = new BehaviorSubject<boolean>(false);

    public toggle() {
        this.sidenavState.next(!this.sidenavState.value);
    }

    public setState(state: boolean) {
        this.sidenavState.next(state);
    }

    public getState() {
        return this.sidenavState.asObservable();
    }
}