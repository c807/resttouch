<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Ventas Callcenter</title>
</head>
<body lang="es-GT" dir="ltr">
	<p class="text-center"><b>Ventas Call Center</b></p>
	<table style="width: 35%;" class="sborder">
		<tr>
			<td class="sborder"><b>Del: </b> </td>
			<td class="sborder"><?php echo formatoFecha($params["fdel"], 2)?></td>
		</tr>
		<tr>
			<td class="sborder"><b>Al:</b> </td>
			<td class="sborder"><?php echo formatoFecha($params["fal"], 2)?></td>
		</tr>
		<tr>
			<td class="sborder"><b>Tipo reporte:</b> </td>
			<td class="sborder"><?php echo $params["tipo_reporte"] == 1 ? "Detallado" : "Resumido" ?></td>
		</tr>
	</table>
	<br>
	<?php foreach ($data as $key => $row): ?>
		<table>
			<thead>
				<tr>
					<th class="titulo text-center" colspan="4"><?php echo $row["nombre"]?></th>
				</tr>
				<tr>
					<th class="totales">Articulo</th>
					<th class="totales text-right">Cantidad</th>
					<th class="totales text-right">Precio</th>
					<th class="totales text-right">Total</th>
				</tr>
			</thead>
			<tbody>
				<?php
					$tmpCantidad = 0;
					$tmpTotal    = 0;
					foreach ($row["detalle"] as $llave => $fila):
						$tmpCantidad += $fila->cantidad; 
						$tmpTotal    += $fila->total;
				?>
					<tr>
						<td><?php echo $fila->narticulo?></td>
						<td class="text-right"><?php echo number_format($fila->cantidad, 2)?></td>
						<td class="text-right"><?php echo number_format($fila->precio, 2)?></td>
						<td class="text-right"><?php echo number_format($fila->total, 2)?></td>
					</tr>
				<?php endforeach ?>
				<tr>
					<td class="totales text-right">Totales</td>
					<td class="totales text-right"><?php echo number_format($tmpCantidad, 2)?></td>
					<td class="totales"></td>
					<td class="totales text-right"><?php echo number_format($tmpTotal, 2)?></td>
				</tr>
			</tbody>
		</table>
		<br>
		<br>
		<br>
	<?php endforeach ?>
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