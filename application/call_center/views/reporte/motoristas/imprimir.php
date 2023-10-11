<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Motoristas</title>
</head>
<body lang="es-GT" dir="ltr">
	<p class="text-center"><b>Motoristas</b></p>
	<table style="width: 35%;" class="sborder">
		<tr>
			<td class="sborder"><b>Del: </b> </td>
			<td class="sborder"><?php echo formatoFecha($params['_fdel'], 2)?></td>
		</tr>
		<tr>
			<td class="sborder"><b>Al:</b> </td>
			<td class="sborder"><?php echo formatoFecha($params['_fal'], 2)?></td>
		</tr>		
	</table>
	<br>
	<table>
		<thead>				
			<tr>
				<th class="totales"><b>Orden No.</b></th>
				<th class="totales"><b>A nombre de</b></th>
				<th class="totales text-right"><b>Total</b></th>
				<th class="totales"><b>Forma de pago</b></th>
				<th class="totales"><b>Fecha</b></th>
				<th class="totales"><b>Hora</b></th>
				<th class="totales"><b>Transcurrido</b></th>
				<th class="totales"><b>Teléfono</b></th>
				<th class="totales"><b>Atendió</b></th>
				<th class="totales"><b>Entrega en</b></th>
				<th class="totales"><b>Restaurante</b></th>
				<th class="totales"><b>Tiempo ofrecido</b></th>
				<th class="totales"><b>Repartidor</b></th>
				<th class="totales"><b>Observaciones</b></th>
			</tr>
		</thead>
		<tbody>				
			<?php foreach ($info as $row): ?>
				<tr>
					<td><?php echo number_format((float)$row->comanda, 0); ?></td>
					<td><?php echo $row->cliente; ?></td>
					<td class="text-right"><?php echo number_format($row->total, 2); ?></td>
					<td><?php echo $row->forma_pago; ?></td>
					<td><?php echo $row->fecha; ?></td>
					<td><?php echo $row->hora; ?></td>
					<td><?php echo $row->transcurrido; ?></td>
					<td><?php echo $row->telefono; ?></td>
					<td><?php echo $row->atendio; ?></td>
					<td><?php echo $row->direccion_entrega; ?></td>
					<td><?php echo $row->sede_atiende; ?></td>
					<td><?php echo $row->tiempo_ofrecido; ?></td>
					<td><?php echo $row->motorista; ?></td>
					<td><?php echo $row->observaciones; ?></td>
				</tr>
			<?php endforeach ?>
			</tbody>
	</table>
</body>
</html>
<style type="text/css">
	body {font-family: sans-serif;}
	table {width: 100%; border-collapse: collapse; border: 1px solid black; padding: 5px;}
	td {width: auto; border-collapse: collapse; border: 1px solid black;}

	.text-right {text-align: right;}
	.text-center {text-align: center;}
	.tabla-contenido {font-size: 0.65em;}
	.tabla-firma {font-size: 0.90em;}
	.tabla-firma-td {border: none; text-align:center;padding: 15px 1px 15 1px;}
	.titulo {text-align: center; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
	.totales {text-align: right; background-color: #E5E5E5; }
	.sborder {border: none;}
</style>