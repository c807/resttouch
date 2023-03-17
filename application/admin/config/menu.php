<?php
defined('BASEPATH') or exit('No direct script access allowed');

$config['menu'] = [
	1 => [
		'nombre' => 'ADMIN',
		'submodulo' => [
			1 => [
				'nombre' => 'Mantenimiento',
				'opciones' => [
					1 => [
						'nombre' => 'Cliente',
						'link' => '/admin/cliente'
					],
					2 => [
						'nombre' => 'Artículos',
						'link' => '/wms/articulos'
					],
					3 => [
						'nombre' => 'Áreas',
						'link' => '/restaurante/mantareas'
					],
					4 => [
						'nombre' => 'Presentaciones',
						'link' => '/admin/presentacion'
					],
					5 => [
						'nombre' => 'Usuario',
						'link' => '/admin/usuario'
					],
					6 => [
						'nombre' => 'Medidas',
						'link' => '/admin/medida'
					],
					7  => [
						'nombre' => 'Impresoras',
						'link' => '/admin/impresora'
					],
					8  => [
						'nombre' => 'Tipo de Usuario',
						'link' => '/admin/tipo_usuario'
					],
					9  => [
						'nombre' => 'Acceso',
						'link' => '/admin/acceso'
					],
					10  => [
						'nombre' => 'Forma de Pago',
						'link' => '/admin/formapago'
					],
					11  => [
						'nombre' => 'Proveedores',
						'link' => '/admin/proveedor'
					],
					12  => [
						'nombre' => 'Impuesto Especial',
						'link' => '/admin/impuesto_especial'
					],
					13 => [
						'nombre' => 'Sede por Usuario',
						'link' => '/admin/usuario_sede'
					],
					14 => [
						'nombre' => 'Configuracion Certificador',
						'link' => '/admin/certificador_admin'
					],
					15 => [
						'nombre' => 'Certificador FEL',
						'link' => '/admin/certificador_fel'
					],
					16 => [
						'nombre' => 'Corporación',
						'link' => '/admin/corporacion'
					],
					17 => [
						'nombre' => 'Razones de anulacion',
						'link' => '/admin/razon_anulacion'
					],
					18 => [
						'nombre' => 'Tipo de compra/venta',
						'link' => '/admin/tipo_compra_venta'
					],
					19 => [
						'nombre' => 'Tipo de documento',
						'link' => '/admin/documento_tipo'
					],
					20 => [
						'nombre' => 'Bodegas',
						'link' => '/admin/bodega'
					],
					21 => [
						'nombre' => 'Edición rápida de artículos',
						'link' => '/wms/qeprod'
					],
					22 => [
						'nombre' => 'Tipo de cliente',
						'link' => '/admin/tipo_cliente'
					],
					23 => [
						'nombre' => 'Tipo de documento de identificación',
						'link' => '/admin/tipo_documento'
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'opciones' => [
					1 => [
						'nombre' => 'Tablero',
						'link' => '/admin/tablero'
					],
					2 => [
						'nombre' => 'Ventas por categoría',
						'link' => '/restaurante/rptvtascat'
					],
					3 => [
						'nombre' => 'Caja',
						'link' => '/restaurante/rptcaja'
					],
					4 => [
						'nombre' => 'Bitácora',
						'link' => '/admin/rptbitacora'
					]
				]
			],
			3 => [
				'nombre' => 'Transacciones',
				'opciones' => [
					1 => [
						'nombre' => 'Replicar artículos a sedes',
						'link' => '/wms/replicar_articulos_sedes'
					],
					2 => [
						'nombre' => 'Anular comandas',
						'link' => '/restaurante/anulacomanda'
					]
				]
			]
		]
	],
	2 => [
		'nombre' => 'POS',
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'opciones' => [
					1 => [
						'nombre' => 'Área',
						'link' => '/restaurante/tranareas'
					],
					2 => [
						'nombre' => 'Factura manual',
						'link' => '/pos/factman'
					],
					3 => [
						'nombre' => 'Turno',
						'link' => '/restaurante/turno'
					],
					4 => [
						'nombre' => 'Comanda en línea',
						'link' => '/restaurante/cmdonline'
					],
					6 => [
						'nombre' => 'Cocina',
						'link' => '/restaurante/trancocina'
					],
					7 => [
						'nombre' => 'Migrar facturas a contabilidad',
						'link' => '/pos/factura_migrar'
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'opciones' => [
					1 => [
						'nombre' => 'Ventas',
						'link' => '/restaurante/rptvtascat'
					],
					2 => [
						'nombre' => 'Turnos',
						'link' => '/restaurante/rptturnos'
					],
					3 => [
						'nombre' => 'Propinas',
						'link' => '/restaurante/rptpropinas'
					],
					4 => [
						'nombre' => 'Caja',
						'link' => '/restaurante/rptcaja'
					],
					5 => [
						'nombre' => 'Factura',
						'link' => '/restaurante/rptfactura'
					],
					6 => [
						'nombre' => 'Autoconsulta',
						'link' => '/restaurante/autoconsulta'
					],
					7 => [
						'nombre' => 'Comandas',
						'link' => '/restaurante/rptcomanda'
					],
					8 => [
						'nombre' => 'Ventas administrativo',
						'link' => '/restaurante/rptvtasadm'
					],
					9 => [
						'nombre' => 'Artículos eliminados',
						'link' => '/restaurante/rptartelim'
					]
				]
			],
			3 => [
				'nombre' => 'Mantenimiento',
				'opciones' => [
					1 => [
						'nombre' => 'Tipo de Turno',
						'link' => '/restaurante/tipoturno'
					],
					2 => [
						'nombre' => 'Distribución de propinas',
						'link' => '/restaurante/propina'
					],
					3 => [
						'nombre' => 'Notas predefinidas',
						'link' => '/restaurante/notas_predefinidas'
					]
				]
			]
		]
	],
	3 => [
		'nombre' => 'FACT',
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'opciones' => [
					1 => [
						'nombre' => 'Formas de pago',
						'link' => '/pos/fpago'
					]
				]
			]
		]
	],
	4 => [
		'nombre' => 'WMS',
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'opciones' => [
					1 => [
						'nombre' => 'Ingresos',
						'link' => '/wms/ingresos'
					],
					2 => [
						'nombre' => 'Egresos',
						'link' => '/wms/egresos'
					],
					3 => [
						'nombre' => 'Transformaciones',
						'link' => '/wms/transformaciones'
					],
					4 => [
						'nombre' => 'Produccion',
						'link' => '/wms/produccion'
					],
					5 => [
						'nombre' => 'Inventario físico',
						'link' => '/wms/fisico'
					],
					6 => [
						'nombre' => 'Cuadre diario',
						'link' => '/wms/cuadre_diario'
					],
					7 => [
						'nombre' => 'Requisiciones',
						'link' => '/wms/requisiciones'
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'opciones' => [
					1 => [
						'nombre' => 'Existencias',
						'link' => '/wms/rptexistencia'
					],
					2 => [
						'nombre' => 'Kardex',
						'link' => '/wms/rptkardex'
					],
					3 => [
						'nombre' => 'Inventario Valorizado',
						'link' => '/wms/rptvalorizado'
					],
					4 => [
						'nombre' => 'Ingreso',
						'link' => '/wms/rptingreso'
					],
					5 => [
						'nombre' => 'Consumos',
						'link' => '/wms/rptconsumos'
					],
					6 => [
						'nombre' => 'Resumen egresos',
						'link' => '/wms/resumen_egreso'
					],
					7 => [
						'nombre' => 'Resumen ingresos',
						'link' => '/wms/resumen_ingreso'
					],
					8 => [
						'nombre' => 'Uso de ingrediente',
						'link' => '/wms/uso_ingrediente'
					],
					9 => [
						'nombre' => 'Margen de receta',
						'link' => '/wms/margen_receta'
					],
					10 => [
						'nombre' => 'Consumo de articulo',
						'link' => '/wms/consumo_articulo'
					]
				]
			],
			3 => [
				'nombre' => 'Mantenimientos',
				'opciones' => [
					1 => [
						'nombre' => 'Bodegas',
						'link' => '/admin/bodega'
					],
					2 => [
						'nombre' => 'Tipos de movimiento',
						'link' => '/wms/tipo_movimiento'
					]
				]
			]
		]
	],
	5 => [
		'nombre' => 'OC',
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'opciones' => [
					1 => [
						'nombre' => 'Órdenes de compra',
						'link' => '/ordcomp/ordcomp'
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'opciones' => [
					1 => [
						'nombre' => 'Lista de pedidos',
						'link' => '/ordcomp/rptlistapedido'
					],
					2 => [
						'nombre' => 'Resumen de pedidos por proveedor',
						'link' => '/ordcomp/resumen_pedidos_proveedor'
					]
				]
			]
		]
	],
	6 => [
		'nombre' => 'CC',
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'opciones' => [
					1 => [
						'nombre' => 'Seguimiento',
						'link' => '/callcenter/seguimiento_callcenter'
					]
				]
			],
			2 => [
				'nombre' => 'Mantenimiento',
				'opciones' => [
					1 => [
						'nombre' => 'Tipos de dirección',
						'link' => '/callcenter/tipo_direccion'
					],
					2 => [
						'nombre' => 'Clientes',
						'link' => '/callcenter/cliente_master'
					],
					3 => [
						'nombre' => 'Tiempos de entrega',
						'link' => '/callcenter/tiempo_entrega'
					],
					4 => [
						'nombre' => 'Estatus pedido',
						'link' => '/callcenter/estatus_callcenter'
					],
					5 => [
						'nombre' => 'Tipo de domicilio',
						'link' => '/callcenter/tipo_domicilio'
					],
					6 => [
						'nombre' => 'Repartidores',
						'link' => '/callcenter/repartidor'
					]
				]
			],
			3 => [
				'nombre' => 'Reportes',
				'opciones' => [
					1 => [
						'nombre' => 'Pedidos por sede',
						'link' => '/callcenter/rpt_pedidos_sede'
					],
					2 => [
						'nombre' => 'Ventas callcenter',
						'link' => '/callcenter/venta_callcenter'
					]
				]
			]
		]
	],
	7 => [
		'nombre' => 'GK',
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'opciones' => [
					1 => [
						'nombre' => 'Seguimiento',
						'link' => '/gk/seguimiento'
					]
				]
			],
			2 => [
				'nombre' => 'Mantenimiento',
				'opciones' => [
					1 => [
						'nombre' => 'Formas de pago por origen',
						'link' => '/admin/fp_co'
					],
					2 => [
						'nombre' => 'Vendors por origen',
						'link' => '/admin/vdt'
					]
				]
			],
			3 => [
				'nombre' => 'Reportes',
				'opciones' => [
					1 => [
						'nombre' => 'Distribución de propinas',
						'link' => '/gk/repdistprop'
					],
					2 => [
						'nombre' => 'Ventas por marca',
						'link' => '/gk/rep_venta_marca'
					]
				]
			]
		]
	],
	8 => [
		'nombre' => 'RSV',
		'submodulo' => [
			1 => [
				'nombre' => 'Transacción',
				'opciones' => [
					1 => [
						'nombre' => 'Reservaciones',
						'link' => '/hotel/reservas'
					]
				]
			],
			2 => [
				'nombre' => 'Reportes',
				'opciones' => [
					1 => [
						'nombre' => 'Historial de reservas',
						'link' => '/hotel/rpthistrsrv'
					]
				]
			],
			3 => [
				'nombre' => 'Mantenimiento',
				'opciones' => [
					1 => [
						'nombre' => 'Clientes',
						'link' => '/callcenter/cliente_master'
					],
					2 => [
						'nombre' => 'Tipos de habitación',
						'link' => '/admin/tipo_habitacion'
					]
				]
			]
		]
	]
];
