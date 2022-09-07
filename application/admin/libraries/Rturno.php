<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Rturno
{
	protected $ci;
	private $token = null;
	private $datos = [];
	private $turno = [];
	private $bodega = [];

	public function __construct()
	{
		$this->ci =& get_instance();
	}

	public function set_token($val)
	{
		$this->token = $val;
	}

	public function set_turno($obj)
	{
		$this->turno = $obj;
	}

	public function set_bodega($obj)
	{
		$this->bodega = $obj;
	}

	private function get_enlace($val="")
	{
		# producción
		return base_url("api/{$val}");

		# local (activar para desarrollo)
		# return base_url("resttouch/{$val}");
	}

	private function enviar_curl($url, $metodo="GET", $datos=[])
	{
		$ch  = curl_init($url);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $metodo);

		if (!empty($datos)) {
			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($datos));
		}

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, [
			"Authorization: {$this->token}",
			"Content-Type: application/json",
			"Accept: application/pdf"
		]);

		$qry = curl_exec($ch);
		$ret = json_decode($qry);
		curl_close($ch);

		if ($ret) {
			if (isset($ret->ruta) && !empty($ret->ruta)) {
				return $ret->ruta;
			}
		}
		return false;
	}

	private function get_caja()
	{
		$url = $this->get_enlace("restaurante.php/reporte/caja");
		
		$data = [
			"fdel"       => formatoFecha($this->turno->inicio, 8),
			"fal"        => formatoFecha($this->turno->fin, 8),
			"_rturno"    => true,
			"turno_tipo" => $this->turno->turno_tipo,
			"sede"       => [$this->turno->sede]
		];
		
		return $this->enviar_curl($url, "POST", $data);
	}

	private function get_venta_categoria()
	{
		$url = $this->get_enlace("facturacion.php/reporte/venta/categoriapdf");

		$data = [
			"fdel"       => formatoFecha($this->turno->inicio, 8),
			"fal"        => formatoFecha($this->turno->fin, 8),
			"_rturno"    => true,
			"turno_tipo" => $this->turno->turno_tipo,
			"sede"       => [$this->turno->sede]
		];
		
		return $this->enviar_curl($url, "POST", $data);
	}

	private function get_ingreso_proveedor()
	{
		$url = $this->get_enlace("wms.php/rep/ingreso/generar_detalle");
		
		$data = [
			"fdel"       => formatoFecha($this->turno->inicio, 8),
			"fal"        => formatoFecha($this->turno->fin, 8),
			"iva"     => 1,
			"reporte" => 1,
			"_rturno" => true,
			"_excel"  => false,
			"sede"    => [$this->turno->sede]
		];
		
		return $this->enviar_curl($url, "POST", $data);
	}

	private function get_resumen_ingreso()
	{
		$url = $this->get_enlace("wms.php/rep/ingreso/generar_resumen");
		
		$data = [
			"fdel"       => formatoFecha($this->turno->inicio, 8),
			"fal"        => formatoFecha($this->turno->fin, 8),
			"iva"     => 1,
			"_rturno" => true,
			"sede"    => [$this->turno->sede]
		];

		if ($this->bodega) {
			$data["bodega"]        = $this->bodega->bodega;
			$data["bodega_nombre"] = $this->bodega->descripcion;
		}
		
		return $this->enviar_curl($url, "POST", $data);
	}

	private function get_resumen_egreso()
	{
		$url = $this->get_enlace("wms.php/reporte/resumen_egreso");
		
		$data = [
			"fdel"       => formatoFecha($this->turno->inicio, 8),
			"fal"        => formatoFecha($this->turno->fin, 8),
			"iva"     => 1,
			"_rturno" => true,
			"sede"    => [$this->turno->sede]
		];

		if ($this->bodega) {
			$data["bodega"]        = $this->bodega->bodega;
			$data["bodega_nombre"] = $this->bodega->descripcion;
		}
		
		return $this->enviar_curl($url, "POST", $data);
	}

	public function get_archivos()
	{
		$temp = [];
		$rep1 = $this->get_caja();
		$rep2 = $this->get_venta_categoria();
		$rep3 = $this->get_ingreso_proveedor();
		$rep4 = $this->get_resumen_ingreso();
		$rep5 = $this->get_resumen_egreso();

		if ($rep1) {
			$temp[] = $rep1;
		}

		if ($rep2) {
			$temp[] = $rep2;
		}

		if ($rep3) {
			$temp[] = $rep3;
		}

		if ($rep4) {
			$temp[] = $rep4;
		}

		if ($rep5) {
			$temp[] = $rep5;
		}

		return $temp;
	}
}

/* End of file Rturno.php */
/* Location: ./application/admin/libraries/Rturno.php */
