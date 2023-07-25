<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Felfacsv
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
			"usuario: {$this->certificador->usuario}",
			"llave: {$this->certificador->llave}"
		));
		
		//$info  = curl_getinfo($ch);
		$query = curl_exec($ch);

		$res        = new stdClass();
		$res->exito = false;
		$res->error = "";

		if (!curl_errno($ch)) {
			$fel = json_decode($query);

			switch ($http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
				case 200: # OK
				case 201: # OK
					if (isset($fel->ok) && $fel->ok) {
						$res->exito = true;
						$res->fe    = $fel;
					} else {
						if (isset($fel->errores)) {
							$tmp = [];
							
							if (is_object($fel->errores)) {
								foreach ($fel->errores as $msg) {
									$tmp[] = $msg;
								}
								$tmp = implode("\n", $tmp);
							} else {
								$tmp = implode("\n", $fel->errores);
							}

							$res->error = $tmp;
						} elseif (isset($fel->mensaje)) {
							$res->error = $fel->mensaje;
						} else {
							$res->error = $fel;
						}
					}
				break;
				default:
					if (is_object($fel)) {
						if (isset($fel->errores)) {
							$tmp = [];
							
							if (is_object($fel->errores) && get_object_vars($fel->errores)) {
								foreach ($fel->errores as $key => $msg) {
									$xmsg = is_string($msg) ? $msg : "";
									$tmp[] = $key. " | " .$xmsg;
								}
							} elseif (is_array($fel->errores) && !empty($fel->errores)) {
								$tmp = $fel->errores;
							} else {
								$tmp[] = $fel->mensaje ?? "Unexpected HTTP code: {$http_code}. Response: {$query}";
							}
							
							$res->error = implode("\n", $tmp);
						} elseif (isset($fel->mensaje)) {
							$res->error = $fel->mensaje;
						} else {
							$res->error = $fel;
						}
					} else {
						$res->error = "Unexpected HTTP code: {$http_code}. Response: {$query}";
					}
				break;
			}
		} else {
			$res->error = "Error de comunicación, favor intente nuevamente.";
		}

		return $res;
	}

	public function procesar_factura()
	{
		$total = 0;
		$data  = [
			"documento" => [
				"tipo_dte"        => str_pad(1, 2, "0", STR_PAD_LEFT),
				"establecimiento" => str_pad($this->sede->fel_establecimiento, 4, "0", STR_PAD_LEFT),
				"condicion_pago"  => 1,
				"receptor"        => [
					"tipo_documento"   => "36",
					"numero_documento" => $this->receptor->nit,
					"nombre"           => $this->receptor->nombre,
					"correo"           => str_replace(" ", "", str_replace(",", ";", $this->factura->correo_receptor))
				]
			]
		];

		foreach ($this->servicios as $key => $row) {

			$cantidad_producto = round($row->cantidad, 2);
			$precio_unitario   = round(($row->total / $row->cantidad), 2);
			$descuento         = round($row->descuento, 2);

			$total += $row->total;

			$item = [
				"tipo"            => 1, # billetes y monedas
				"cantidad"        => $cantidad_producto,
				"unidad_medida"   => 59, # Unidad
				"descuento"       => $descuento,
				"descripcion"     => $row->articulo->descripcion,
				"precio_unitario" => $precio_unitario
			];

			if ($this->factura->exenta == 1) {
				$item["tipo_venta"] = 3;
			}

			$data["documento"]["items"][] = (object) $item;
		}

		$data["documento"]["pagos"][] = (object) array(
			"tipo"  => "01",
			"monto" => $total
		);

		$this->data = json_encode($data);
	}

	public function anular($comentario="")
	{
		$data = array(
			"invalidacion" => array(
				"uuid"            => $this->factura->fel_uuid,
				"establecimiento" => str_pad($this->sede->fel_establecimiento, 4, "0", STR_PAD_LEFT),
				"tipo_anulacion"  => 2,
				"motivo"          => $comentario ?? "ERROR DE EMISIÓN",
				"responsable"     => array(
					"tipo_documento"   => "36",
					"nombre"           => $this->empresa->nombre,
					"numero_documento" => $this->empresa->nit
				),
				"solicitante" => array(
					"tipo_documento"   => "36",
					"nombre"           => $this->receptor->nombre,
					"numero_documento" => $this->receptor->nit,
					"correo"           => str_replace(" ", "", str_replace(",", ";", $this->factura->correo_receptor))
				)
			)
		);

		$ch = curl_init($this->certificador->vinculo_anulacion);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			"Content-Type: application/json",
			"usuario: {$this->certificador->usuario}",
			"llave: {$this->certificador->llave}"
		));
		
		$query = curl_exec($ch);

		$res        = new stdClass();
		$res->exito = false;
		$res->error = "";

		if (!curl_errno($ch)) {
			$fel = json_decode($query);

			switch ($http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
				case 200: # OK
				case 201: # OK
					if (isset($fel->ok) && $fel->ok) {
						$res->exito = true;
						$res->fe    = $fel;
					} else {
						if (isset($fel->errores)) {
							$tmp = [];
							
							if (is_object($fel->errores)) {
								foreach ($fel->errores as $msg) {
									$tmp[] = $msg;
								}
								$tmp = implode("\n", $tmp);
							} else {
								$tmp = implode("\n", $fel->errores);
							}

							$res->error = $tmp;
						} elseif (isset($fel->mensaje)) {
							$res->error = $fel->mensaje;
						} else {
							$res->error = $fel;
						}
					}
				break;
				default:
					if (is_object($fel)) {
						if (isset($fel->errores)) {
							$tmp = [];
							
							if (is_object($fel->errores) && get_object_vars($fel->errores)) {
								foreach ($fel->errores as $key => $msg) {
									$xmsg = is_string($msg) ? $msg : "";
									$tmp[] = $key. " | " .$xmsg;
								}
							} elseif (is_array($fel->errores) && !empty($fel->errores)) {
								$tmp = $fel->errores;
							} else {
								$tmp[] = $fel->mensaje ?? "Unexpected HTTP code: {$http_code}. Response: {$query}";
							}
							
							$res->error = implode("\n", $tmp);
						} elseif (isset($fel->mensaje)) {
							$res->error = $fel->mensaje;
						} else {
							$res->error = $fel;
						}
					} else {
						$res->error = "Unexpected HTTP code: {$http_code}. Response: {$query}";
					}
				break;
			}
		} else {
			$res->error = "Error de comunicación, favor intente nuevamente.";
		}

		return $res;
	}
}

/* End of file Felfacsv.php */
/* Location: ./application/facturacion/libraries/Felfacsv.php */
