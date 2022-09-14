<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Felfacpan
{
	protected $ci;
	protected $data         = [];
	protected $mascara      = "0000000000";
	protected $cod_isc      = "7010";
	protected $factura      = [];
	protected $servicios    = [];
	protected $empresa      = [];
	protected $receptor     = [];
	protected $sede         = [];
	protected $serie        = [];
	protected $certificador = [];

	public function __construct()
	{
		$this->ci =& get_instance();
	}

	public function set_factura($obj)
	{
		$this->factura = $obj;
	}

	public function set_servicios($obj)
	{
		$this->servicios = $obj;
	}

	public function set_empresa($obj)
	{
		$this->empresa = $obj;
	}

	public function set_receptor($obj)
	{
		$this->receptor = $obj;
	}

	public function set_sede($obj)
	{
		$this->sede = $obj;
	}

	public function set_serie($obj)
	{
		$this->serie = $obj;
	}

	public function set_certificador($obj)
	{
		$this->certificador = $obj;
	}

	public function enviar()
	{
		$ch = curl_init($this->certificador->vinculo_firma);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $this->data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			"Content-Type: application/json",
			"usuario-api: {$this->certificador->usuario}",
			"llave-api: {$this->certificador->llave}",
			"llave-firma: {$this->certificador->firma_llave}"
		));
		
		$info  = curl_getinfo($ch);
		$query = curl_exec($ch);
		$firma = json_decode($query);

		return $firma;
	}

	public function procesar_factura()
	{
		$mascara     = substr($this->mascara, 0, strlen($this->mascara)-strlen($this->factura->factura_serie_correlativo));
		$numeroFac   = $mascara.$this->factura->factura_serie_correlativo;
		$nitReceptor = $this->factura->exenta ? "CF" : $this->receptor->nit;
		$tasaItbms   = $this->factura->exenta ? "00" : "01";
		$total       = 0.00;
		$strMontos = [];
		
		$data = [
			"tipo_emision"            => "01",
			"tipo_documento"          => "01",
			"numero_documento_fiscal" => $numeroFac,
			"punto_facturacion"       => "001",
			"tipo_transaccion_venta"  => 1,
			"emisor_codigo_sucursal"  => str_pad($this->sede->fel_establecimiento, 4, "0", STR_PAD_LEFT),
			"receptor"                => [
				"receptor_nombre" => $this->receptor->nombre
			],
			"items"                   => [],
			"formas_pago_factura"     => []
		];

		if (!empty($this->factura->correo_receptor)) {
			$data["receptor"]["receptor_correo"] = str_replace(" ", "", str_replace(",", ";", $this->factura->correo_receptor));
		}

		if (strtoupper($nitReceptor) == "CF") {
			$data["receptor"]["receptor_tipo"] = "02";
		} else {
			$data["receptor"]["receptor_tipo"]               = "01";
			$data["receptor"]["receptor_digito_verificador"] = "05";
			$data["receptor"]["receptor_tipo_contribuyente"] = 1;
			$data["receptor"]["receptor_ruc"]                = $nitReceptor;
		}


		foreach ($this->servicios as $key => $row) {

			$cantidad_producto = number_format(round($row->cantidad, 2), 2, ".", "");
			$precio_unitario   = number_format(round(($row->monto_base / $row->cantidad), 2), 2, ".", "");
			$descuento         = number_format(round($row->descuento, 2), 2, ".", "");

			$data["items"][] = (object) [
				"descripcion_producto"       => $row->articulo->descripcion,
				"codigo_interno"             => $row->articulo->codigo ? $row->articulo->codigo : "0",
				"unidad_medida"              => "und",
				"cantidad_producto"          => $cantidad_producto,
				"precio_unitario"            => $precio_unitario,
				"descuento"                  => $descuento,
				"tasa_itbms"                 => $tasaItbms,
				"codificacion_completa_cpbs" => $this->cod_isc
			];

			$strMontos[] = $cantidad_producto;
			$strMontos[] = $precio_unitario;
			$strMontos[] = $descuento;

			$total+= $row->total;
		}

		$total = number_format(round($total, 2), 2, ".", "");

		$data["formas_pago_factura"][] = (object) [
			"forma_pago"       => "02",
			"forma_pago_monto" => $total
		];

		$strMontos[] = $total;

		$json = json_encode($data);

		foreach ($strMontos as $value) {
			$json = str_replace('"'.$value.'"', ''.$value.'', $json);
		}

		$this->data = $json;
	}

	public function anular($comentario="")
	{
		$data = [
			"cufe"             => $this->factura->fel_uuid,
			"motivo_anulacion" => $comentario ?? "ERROR DE EMISIÓN"
		];

		$ch = curl_init($this->certificador->vinculo_anulacion);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			"Content-Type: application/json",
			"usuario-api: {$this->certificador->usuario}",
			"llave-api: {$this->certificador->llave}",
			"llave-firma: {$this->certificador->firma_llave}"
		));
		
		$info  = curl_getinfo($ch);
		$query = curl_exec($ch);
		$json  = json_decode($query);

		return $json;
	}
}

/* End of file Felfacpan.php */
/* Location: ./application/facturacion/libraries/Felfacpan.php */
