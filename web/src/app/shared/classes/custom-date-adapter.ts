import { Injectable } from '@angular/core';
import { NativeDateAdapter, MatDateFormats } from '@angular/material/core';

@Injectable({
    providedIn: 'root'
})
export class CustomDateAdapter extends NativeDateAdapter {
    override getDayOfWeekNames(style: 'long' | 'short' | 'narrow') {
        return ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    }

    override getFirstDayOfWeek(): number {
        return 1;
    }

    override parse(value: any): Date | null {
        if (typeof value === 'string' && value.indexOf('/') > -1) {
            const str = value.split('/');

            const year = Number(str[2]);
            const month = Number(str[1]) - 1;
            const date = Number(str[0]);

            return new Date(year, month, date);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
    }

    override format(date: Date, displayFormat: Object): string {
        if (displayFormat === 'input') {
            let day: string = date.getDate().toString();
            day = +day < 10 ? '0' + day : day;
            let month: string = (date.getMonth() + 1).toString();
            month = +month < 10 ? '0' + month : month;
            let year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return date.toDateString();
    }
}

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
    parse: {
        dateInput: { month: 'short', year: 'numeric', day: 'numeric' }        
    },
    display: {
        dateInput: 'input',
        monthYearLabel: { year: 'numeric', month: 'short' },        
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },        
        monthYearA11yLabel: { year: 'numeric', month: 'long' },        
    }    
};
