<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Documento_model extends General_model {

	public $documento;
	public $ingreso;
	public $documento_tipo;
	public $serie;
	public $numero;
    public $fecha;
    public $tipo_compra_venta;
	public $enviado = 0;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("documento");

		if(!empty($id)) {
			$this->cargar($id);
        }
    }
	
	public function getDataContable($id)
	{
		$query = "SELECT e.codigo AS idempresa, f.codigo AS idproveedor, a.serie, a.numero AS documento, DATE(NOW()) AS fechaingresostr, MONTH(a.fecha) AS mesiva, 
		a.fecha AS fechafacturastr, g.codigo AS idtipocompra, b.comentario AS conceptomayor, 0 AS creditofiscal, 0 AS extraordinario, DATE(NOW()) AS fechapagostr, 
		0 AS ordentrabajo, 0.00 AS totfact, 0.00 AS noafecto, 0.00 AS subtotal, 0.00 AS iva, 1 AS idmoneda, 1.0000 AS tipocambio, h.codigo AS idtipofactura, 
		0.00 AS isr, b.ingreso, e.porcentaje_iva, 0 AS idtipocombustible, 0.00 AS galones, 0.00 AS idp, d.codigo AS idproyecto, f.cuenta_contable_gasto
		FROM documento a
		INNER JOIN ingreso b ON b.ingreso = a.ingreso
		INNER JOIN bodega c ON c.bodega = b.bodega
		INNER JOIN sede d ON d.sede = c.sede
		INNER JOIN empresa e ON e.empresa = d.empresa
		INNER JOIN proveedor f ON f.proveedor = b.proveedor
		INNER JOIN tipo_compra_venta g ON g.tipo_compra_venta = a.tipo_compra_venta
		INNER JOIN documento_tipo h ON h.documento_tipo = a.documento_tipo
		WHERE a.documento = $id";

		$data = $this->db->query($query)->row();

		if($data) {
			$query = "SELECT SUM(precio_total + precio_costo_iva) AS total FROM ingreso_detalle WHERE ingreso = $data->ingreso";
			$suma = $this->db->query($query)->row();
			if($suma) {
				$total = round((float)$suma->total, 2);
				$subtotal = round($total / (1 + (float)$data->porcentaje_iva), 2);
				$iva = round($total - $subtotal, 2);

				$data->totfact = $total;
				$data->subtotal = $subtotal;
				$data->iva = $iva;
			}
		}

		return $data;
	}
}