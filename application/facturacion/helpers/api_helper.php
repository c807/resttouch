<?php 

if ( ! function_exists('post_request'))
{
	function post_request($url, $params = '', $header=[], $esJson = true)
	{
		if ($esJson) {
			$header[] = 'Content-Type:application/json';
		}
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		$res = curl_exec($ch);
		curl_close($ch);
		return $res;
	}
}

if ( ! function_exists('get_request'))
{
	function get_request($url, $header=[], $esJson = true)
	{
		if ($esJson) {
			$header[] = 'Content-Type:application/json';
		}
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header);		
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		$res = curl_exec($ch);
		curl_close($ch);
		return $res;
	}
}

if (! function_exists('facturar')) {
	function facturar($fac, $facturaRedondeaMontos = true)
	{
		$datos = ["exito" => false];
		$fac->cargarFacturaSerie();
		$fac->cargarEmpresa();
		$fac->cargarMoneda();
		$fac->cargarReceptor();
		$fac->cargarSede();
		$fac->cargarCertificadorFel();
		$fac->procesar_factura($facturaRedondeaMontos);
		$cer = $fac->getCertificador();

		$funcion = $cer->metodo_factura;
		$resp = $fac->$funcion();
		$fac->setBitacoraFel(['resultado' => json_encode($resp)]);
				
		if (!empty($fac->numero_factura)) {
			$fac->certificador_fel = $cer;
			$fac->detalle = $fac->getDetalle();
			$fac->fecha_autorizacion = $resp->fecha;

			$comanda = $fac->getComanda();
			$fac->origen_datos = ($comanda) ? $comanda->getOrigenDatos() : null;

			$datos['exito'] = true;
			$datos['factura'] = $fac;
			$datos['mensaje'] = "Datos actualizados con exito";	
		} else {
			$datos['mensaje'] = implode(". ", $fac->getMensaje());
		}

		return $datos;
	}
}