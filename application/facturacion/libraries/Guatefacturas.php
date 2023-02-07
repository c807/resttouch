<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Guatefacturas
{
    public $esPrueba = true;
    private $protocolo = 'https';
    private $URL_PRUEBA = 'pdte.guatefacturas.com/webservices63/feltestSB/Guatefac?WSDL';
    private $URL = 'pdte.guatefacturas.com/webservices63/fel/Guatefac?WSDL';
    private $USR_BASICO = 'usr_guatefac';
    private $PWD_BASICO = 'usrguatefac';
    private $xml = null;
    private $strXml = '<DocElectronico><Encabezado><Receptor><NitReceptor/><Nombre/><Direccion/></Receptor><InfoDoc><TipoVenta/><DestinoVenta/><Fecha/><Moneda/><Tasa/><Referencia/><Reversion/></InfoDoc><Totales><Bruto/><Descuento/><Exento/><Otros/><Neto/><Isr/><Iva/><Total/></Totales><DatosAdicionales><TipoReceptor/></DatosAdicionales></Encabezado><Detalles/></DocElectronico>';
    private $factura = null;
    private $detalleFactura = [];
    private $sumas = null;
    private $funcFirma = 'generaDocumento';
    private $funcAnula = 'anulaDocumento';

    public function __construct()
    {
        $this->ci =& get_instance();
    }
    
    private function set_properties($factura, $configuracion = [])
    {
        $this->factura = $factura;
        if ($this->factura) {
            $this->detalleFactura = $this->factura->getDetalle([], false);
        }
        
        foreach ($configuracion as $config => $valor) {
            if (property_exists($this, $config)) {
                $this->$config = $valor;
            }
        }
    
        $this->sumas = (object)['Bruto' => 0, 'Descuento' => 0, 'Exento' => 0, 'Otros' => 0, 'Neto' => 0, 'Isr' => 0, 'Iva' => 0, 'Total' => 0];
        $this->xml = new DOMDocument();
        $this->xml->validateOnParse = true;
        $this->xml->loadXML($this->strXml);        

    }

    private function crearElemento($nombre, $valor = '', $attr = ['SNS' => true], $cdata = false)
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

    private function set_receptor()
    {
        $documentoReceptor = '';
        $tipoReceptor = 4;
        if ($this->factura->fel_uuid && !is_null($this->factura->fel_uuid) && !empty($this->factura->fel_uuid)) {
            if ($this->factura->documento_receptor && !is_null($this->factura->documento_receptor) && !empty($this->factura->documento_receptor)) {
                $documentoReceptor = $this->factura->documento_receptor;
                if ($this->factura->tipo_documento_receptor && !is_null($this->factura->tipo_documento_receptor) && !empty($this->factura->tipo_documento_receptor)) {
                    switch (trim($this->factura->tipo_documento_receptor)) {
                        case 'CUI':
                            $tipoReceptor = 2;
                        case 'EXT':
                            $tipoReceptor = 3;
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

        $this->xml->getElementsByTagName('NitReceptor')->item(0)->nodeValue = trim($documentoReceptor);
        $this->xml->getElementsByTagName('Nombre')->item(0)->nodeValue = htmlspecialchars(trim($this->factura->receptor->nombre), ENT_XML1);
        $this->xml->getElementsByTagName('TipoReceptor')->item(0)->nodeValue = $tipoReceptor;
        $this->xml->getElementsByTagName('Direccion')->item(0)->nodeValue = htmlspecialchars(trim($this->factura->receptor->direccion), ENT_XML1);
    }

    private function get_tipo_venta()
    {
        $cntBien = 0;
        $cntServicio = 0;
        foreach ($this->detalleFactura as $det) {
            switch (trim($det->bien_servicio)) {
                case 'B':
                    $cntBien += 1;
                    break;
                case 'S':
                    $cntServicio += 1;
                    break;
            }
        }

        if ($cntBien > $cntServicio) {
            return 'B';
        } else if ($cntServicio > $cntBien) {
            return 'S';
        } else {
            return 'B';
        }
    }

    private function set_infodoc()
    {
        $this->xml->getElementsByTagName('TipoVenta')->item(0)->nodeValue = $this->get_tipo_venta();
        $this->xml->getElementsByTagName('DestinoVenta')->item(0)->nodeValue = 1;
        $this->xml->getElementsByTagName('Fecha')->item(0)->nodeValue = formatoFecha($this->factura->fecha_factura, 2);
        $this->xml->getElementsByTagName('Moneda')->item(0)->nodeValue = (int)$this->factura->moneda->moneda;
        $this->xml->getElementsByTagName('Tasa')->item(0)->nodeValue = 1;
        $this->xml->getElementsByTagName('Referencia')->item(0)->nodeValue = (int)$this->factura->factura;
    }

    private function generaEncabezado()
    {
        $this->set_receptor();
        $this->set_infodoc();
    }

    private function generaDetalle() {
        $detalles = $this->xml->getElementsByTagName('Detalles')->item(0);

        $detsFact = [];

        if ((int)$this->factura->enviar_descripcion_unica === 1 && !is_null($this->factura->descripcion_unica) && trim($this->factura->descripcion_unica) !== '') {
            $row = (object)[
				'bien_servicio' => 'B',
				'cantidad' => 1,
				'articulo' => (object)['articulo' => 'ADU', 'descripcion' => $this->factura->descripcion_unica],
				'precio_unitario' => 0.00,
				'precio_unitario_ext' => 0.00,
				'subtotal' => 0.00,
				'descuento' => 0.00,
				'descuento_ext' => 0.00,
				'total' => 0.00,
				'monto_base' => 0.00,
				'monto_base_ext' => 0.00,
				'monto_iva' => 0.00,
				'monto_iva_ext' => 0.00,
				'impuesto_especial' => []
			];
            foreach ($this->detalleFactura as $det) {
				$row->precio_unitario += $det->subtotal;
				$row->precio_unitario_ext += $det->subtotal;
				$row->subtotal += $det->subtotal;
				$row->descuento += $det->descuento;
				$row->descuento_ext += $det->descuento_ext;
				$row->total += $det->total;
				$row->monto_base += $det->monto_base;
				$row->monto_base_ext += $det->monto_base_ext;
				$row->monto_iva += $det->monto_iva;
				$row->monto_iva_ext += $det->monto_iva_ext;
				if (!is_null($det->impuesto_especial) && (int)$det->impuesto_especial > 0) {
					$cntImpEsp = count($row->impuesto_especial);
					$idx = -1;
					for ($i = 0; $i < $cntImpEsp; $i++) {
						if ((int)$row->impuesto_especial[$i]->impuesto_especial === (int)$det->impuesto_especial) {
							$idx = $i;
							break;
						}
					}

					if ($idx < 0) {
						$row->impuesto_especial[] = (object)[
							'impuesto_especial' => $det->impuesto_especial,
							'valor_impuesto_especial' => (float)$det->valor_impuesto_especial,
							'valor_impuesto_especial_ext' => (float)$det->valor_impuesto_especial_ext,
							'precio_sugerido' => (float)$det->precio_sugerido,
							'precio_sugerido_ext' => (float)$det->precio_sugerido_ext,
							'cantidad_gravable' => (float)$det->cantidad_gravable,
						];
					} else {
						$row->impuesto_especial[$idx]->valor_impuesto_especial += $det->valor_impuesto_especial;
						$row->impuesto_especial[$idx]->valor_impuesto_especial_ext += $det->valor_impuesto_especial_ext;
						$row->impuesto_especial[$idx]->cantidad_gravable += $det->cantidad_gravable;
					}
				}
			}
        } else {
            $detsFact = $this->detalleFactura;            
        }
        
        foreach($detsFact as $det) {
            $productos = $this->crearElemento('Productos');
            $productos->appendChild($this->crearElemento('Producto', $det->articulo->articulo));
            $productos->appendChild($this->crearElemento('Descripcion', trim($det->articulo->descripcion)));
            $productos->appendChild($this->crearElemento('Medida', 1));
            $productos->appendChild($this->crearElemento('Cantidad', $det->cantidad));
            $productos->appendChild($this->crearElemento('Precio', round((float)$det->precio_unitario_ext, 2)));
            $porDesc = (float)$det->descuento_ext === (float)0 ? (float)0.00 : round((float)$det->descuento_ext * 100 / (float)$det->total_ext, 2);
            $productos->appendChild($this->crearElemento('PorcDesc', $porDesc));
            $productos->appendChild($this->crearElemento('ImpBruto', round((float)$det->total_ext, 2)));
            $this->sumas->Bruto += (float)$det->total_ext;
            $productos->appendChild($this->crearElemento('ImpDescuento', round((float)$det->descuento_ext)));
            $this->sumas->Descuento += (float)$det->descuento_ext;
            $productos->appendChild($this->crearElemento('ImpExento', $this->factura->exenta ? (float)0.00 : round((float)$det->monto_iva_ext, 2)));
            $this->sumas->Exento += $this->factura->exenta ? (float)0.00 : (float)$det->monto_iva_ext;
            $impOtros = (float)0.00;
            if ($det->impuesto_especial && is_array($det->impuesto_especial) && count($det->impuesto_especial) > 0) {
                foreach($det->impuesto_especial as $ie) {
                    $impOtros += (float)$ie->valor_impuesto_especial_ext;
                }
            }
            $productos->appendChild($this->crearElemento('ImpOtros', round($impOtros, 2)));
            $this->sumas->Otros += $impOtros;
            $productos->appendChild($this->crearElemento('ImpNeto', round((float)$det->total_ext - (float)$det->descuento_ext, 2)));
            $this->sumas->Neto += ((float)$det->total_ext - (float)$det->descuento_ext);
            $productos->appendChild($this->crearElemento('ImpIsr', (float)0.00));
            $productos->appendChild($this->crearElemento('ImpIva', round((float)$det->monto_iva_ext, 2)));
            $this->sumas->Iva += (float)$det->monto_iva_ext;
            $productos->appendChild($this->crearElemento('ImpTotal', round($det->total_ext - $det->descuento_ext, 2)));
            $this->sumas->Total += ((float)$det->total_ext - (float)$det->descuento_ext);
            $productos->appendChild($this->crearElemento('TipoVentaDet', $det->bien_servicio));
            $detalles->appendChild($productos);
        }
        $this->llenaTotalesEncabezado();
    }

    private function llenaTotalesEncabezado()
    {
        $sumasArray = (array)$this->sumas;
        foreach($sumasArray as $tag => $val) {
            $this->xml->getElementsByTagName($tag)->item(0)->nodeValue = round($val, 2);
        }
    }

    public function generaXML($factura, $configuracion = [])
    {
        $this->set_properties($factura, $configuracion);
        $this->generaEncabezado();
        $this->generaDetalle();
    }

    public function getXml() {
        return $this->xml->saveXML();
    }

    public function enviar() {
        $ws = "{$this->protocolo}://{$this->USR_BASICO}:{$this->PWD_BASICO}@".(!$this->esPrueba ? $this->URL : $this->URL_PRUEBA);
        $gtfac = new SoapClient($ws);
        
        $gtfac->__soapCall($this->funcFirma, []);

    }
}
