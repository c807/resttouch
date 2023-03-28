<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Abono_model extends General_model {

	public $abono;
	public $reserva = null;
	public $factura = null;
	public $fecha;
	public $fhcreacion;
    public $usuario;
    public $anulado = 0;
    public $fecha_anulacion = null;
    public $anuladopor = null;

	public function __construct($id = null)
	{
		parent::__construct();
		$this->setTabla('abono');

		if($id !== null) {
			$this->cargar($id);
		}
	}

    public function get_reserva($idReserva = null) {
        if (empty($idReserva)) {
            $idReserva = $this->reserva;
        }
        $this->load->model('Reserva_model');
        return new Reserva_model($idReserva);
    }

    public function get_factura($idFactura = null) {
        if (empty($idFactura)) {
            $idFactura = $this->factura;
        }
        $this->load->model('Factura_model');
        return new Factura_model($idFactura);
    }

    private function get_usr($idUsuario) {        
        $this->load->model('Usuario_model');
        return new Usuario_model($idUsuario);
    }

    public function get_usuario($idUsuario = null) {
        if (empty($idUsuario)) {
            $idUsuario = $this->usuario;
        }
        $usr = $this->get_usr($idUsuario);
        unset($usr->contrasenia);
        return $usr;
    }

    public function get_anuladopor($idUsuario = null) {
        if (empty($idUsuario)) {
            $idUsuario = $this->anuladopor;
        }
        $usr = $this->get_usr($idUsuario);
        unset($usr->contrasenia);
        return $usr;
    }

    public function get_monto($idAbono = null)
    {
        if (empty($idAbono)) {
            $idAbono = $this->getPK();
        }
        $suma = $this->db->select('SUM(monto) AS monto')->where('abono', $idAbono)->get('abono_forma_pago')->row();

        if ($suma) {
            return (float)$suma->monto;
        }

        return (float)0;
    }
}