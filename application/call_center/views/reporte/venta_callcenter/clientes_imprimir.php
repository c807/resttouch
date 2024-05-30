<!DOCTYPE html>
<html lang="es-GT">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Reporte de Clientes</title>
</head>
<body>
	<p class="text-center title"><b>Reporte de Clientes</b></p>
	<?php foreach ($data as $sede => $info): ?>
		<table class="sede-table" style="width: 35%;">
			<tr>
				<td class="sborder sede-info"><b>Sede: </b></td>
				<td class="sborder sede-info"><?php echo formatoFecha($info['nombre'], 2) . ' (' . $info['alias'] . ')'; ?></td>
			</tr>
		</table>
		<table>
			<thead>				
				<tr>
					<th class="th-center"><b>No.</b></th>
					<th class="th-center"><b>Nombre</b></th>
					<th class="th-center"><b>Número Telefónico</b></th>
					<th class="th-center"><b>Dirección</b></th>
					<th class="th-center"><b>Nit</b></th>
				</tr>
			</thead>
			<tbody>				
				<?php foreach ($info['detalle'] as $cliente): ?>
					<tr>
						<td><?php echo $cliente->cliente_master; ?></td>
						<td><?php echo $cliente->nombre_cliente; ?></td>
						<td><?php echo $cliente->telefono_cliente; ?></td>
						<td><?php echo $cliente->direccion_cliente; ?></td>
						<td><?php echo $cliente->nit_cliente; ?></td>
					</tr>
				<?php endforeach ?>
			</tbody>
		</table>
	<?php endforeach ?>
</body>
</html>
<style type="text/css">
		body {
			font-family: sans-serif;
		}
		table {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 20px;
		}
		td, th {
			border: 1px solid black;
			padding: 8px;
			text-align: left;
		}
		th {
			background-color: #E5E5E5;
			font-weight: bold;
			text-align: center;
		}
		.text-right {
			text-align: right;
		}
		.text-center {
			text-align: center;
		}
		.totales {
			text-align: right;
			background-color: #E5E5E5;
		}
		.sborder {
			border: none;
		}
		.th-center {
			text-align: center;
		}
		.title {
			font-size: 1.5em;
			margin-bottom: 20px;
		}
		.sede-info {
			font-size: 1.2em;
		}
		.sede-table {
			margin-bottom: 5px;
		}
	</style>