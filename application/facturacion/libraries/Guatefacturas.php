<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Guatefacturas
{
    public $esPrueba = true;
    private $URL_PRUEBA = 'https://pdte.guatefacturas.com/webservices63/feltestSB/Guatefac?WSDL';
    private $URL = 'https://pdte.guatefacturas.com/webservices63/fel/Guatefac?WSDL';
    private $USR_BASICO = 'usr_guatefac';
    private $PWD_BASICO = 'usrguatefac';
    private $xml = null;
    private $strXml = '<DocElectronico><Encabezado><Receptor><NitReceptor/><Nombre/><Direccion/></Receptor><InfoDoc><TipoVenta/><DestinoVenta/><Fecha/><Moneda/><Tasa/><Referencia/><Reversion/></InfoDoc><Totales><Bruto/><Descuento/><Exento/><Otros/><Neto/><Isr/><Iva/><Total/></Totales><DatosAdicionales><TipoReceptor/></DatosAdicionales></Encabezado><Detalles><Productos></Productos></Detalles></DocElectronico>';
    private $factura = null;

    public function __construct($factura, $configuracion = [])
    {
        $this->factura = $factura;
        foreach($configuracion as $config => $valor) {
            if (property_exists($this, $config)) {
                $this->$config = $valor;
            }
        }
        $this->xml = new DOMDocument();
        $this->xml->validateOnParse = true;
        $this->xml->loadXML($this->strXml);
    }

    private function crearElemento($nombre, $valor = '', $attr = array(), $cdata = false)
	{
		if ($cdata) {
			$txt = $this->xml->createCDATASection($valor);
			$valor = '';
		}

		# Sin NS
		if (isset($attr['SNS'])) {
			$nodo = $this->xml->createElement($nombre, $valor);
			unset($attr['SNS']);
		} else {
			$nodo = $this->xml->createElementNS($this->namespaceURI, $nombre, $valor);
		}

		if (is_array($attr) && count($attr) > 0) {
			foreach ($attr as $key => $value) {
				$nodo->setAttribute($key, $value);
			}
		}

		if ($cdata) {
			$nodo->appendChild($txt);
		}

		return $nodo;
	}

    private function set_receptor() {        
        $this->xml->getElementsByTagName('Nombre')->item(0)->nodeValue = htmlspecialchars($this->factura->receptor->nombre, ENT_XML1);
    
        $documentoReceptor = '';
        $tipoReceptor = 4;
        if ($this->factura->fel_uuid && !is_null($this->factura->fel_uuid) && !empty($this->factura->fel_uuid)) {
            if ($this->factura->documento_receptor && !is_null($this->factura->documento_receptor) && !empty($this->factura->documento_receptor)) {
                $documentoReceptor = $this->factura->documento_receptor;
                if ($this->factura->tipo_documento_receptor && !is_null($this->factura->tipo_documento_receptor) && !empty($this->factura->tipo_documento_receptor)) {
                    switch (trim($this->factura->tipo_documento_receptor)) {
                        case 'CUI': $tipoReceptor = 2;
                        case 'EXT': $tipoReceptor = 3;
                    }
                }
            } else {
                $documentoReceptor = $this->factura->receptor->nit;
            }
        } else {
            $documentoReceptor = $this->factura->receptor->nit;
            if (!$documentoReceptor || is_null($documentoReceptor) || empty(trim($documentoReceptor))) {
                $documentoReceptor = $this->factura->receptor->cui;
                $tipoReceptor = 2;
                if (!$documentoReceptor || is_null($documentoReceptor) || empty(trim($documentoReceptor))) {
                    $documentoReceptor = $this->factura->receptor->pasaporte;
                    $tipoReceptor = 3;
                }				
            }
        }
    
        $this->xml->getElementsByTagName('NitReceptor')->item(0)->nodeValue = $documentoReceptor;
        $this->xml->getElementsByTagName('TipoReceptor')->item(0)->nodeValue = $tipoReceptor;
        $this->xml->getElementsByTagName('Direccion')->item(0)->nodeValue = htmlspecialchars($this->factura->receptor->direccion, ENT_XML1);
    }

    private function set_infodoc() {
        $this->xml->getElementsByTagName('TipoVenta')->item(0)->nodeValue = 'B';
        $this->xml->getElementsByTagName('DestinoVenta')->item(0)->nodeValue = 1;
        $this->xml->getElementsByTagName('Fecha')->item(0)->nodeValue = formatoFecha($this->factura->fecha, 2);
        $this->xml->getElementsByTagName('Moneda')->item(0)->nodeValue = (int)$this->factura->moneda;
        $this->xml->getElementsByTagName('Tasa')->item(0)->nodeValue = 1;
        $this->xml->getElementsByTagName('Referencia')->item(0)->nodeValue = (int)$this->factura->factura;
    }

    private function generaEncabezado() {
        $this->set_receptor();
        $this->set_infodoc();
    }

    public function generaXML() {
        $this->generaEncabezado();
    }




}