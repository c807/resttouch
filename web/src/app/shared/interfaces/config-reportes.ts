export interface ConfiguracionFechas {
    isRequiredFDel: boolean;
    isRequiredFAl: boolean;
}

export interface ConfiguracionBotones {
    isHtmlDisabled?: boolean;
    isPdfDisabled?: boolean;
    isExcelDisabled?: boolean;
    isImprimirDisabled?: boolean;
    showHtml?: boolean;
    showPdf?: boolean;
    showExcel?: boolean;
    showImprimir?: boolean;
}

export interface DialogCocina {
    respuesta: boolean,
    tiempo: string
}