<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Resumen de egresos</title>
</head>
<body lang="es-GT" dir="ltr">
	<table class="table">
		<thead>
			<tr>
				<th colspan="8" class="encabezado text-center sborder"><h2>Resumen de egresos</h2></th>
			</tr>
			<tr>
				<th colspan="8" class="encabezado text-center sborder">Del: <?php echo formatoFecha($params["fdel"], 2)?> Al: <?php echo formatoFecha($params["fal"], 2)?></th>
			</tr>
			<tr>
				<th colspan="8" class="encabezado text-left sborder"><small>Bodega: <?php echo $params["bodega_nombre"]?></small></th>
			</tr>
			<tr>
				<th colspan="8" class="encabezado text-left sborder"><small>Sede: <?php echo "{$params['sede']->nombre} ({$params['sede']->alias})"?></small></th>
			</tr>
			<tr>
				<td colspan="8"><br></td>
			</tr>
			<tr>
				<th class="encabezado text-center" colspan="2">Fecha</th>
				<th class="encabezado text-left" colspan="2">Documento</th>
				<th class="encabezado text-center" colspan="1">Estatus egreso</th>
				<th class="encabezado text-center" colspan="1">Tipo</th>
				<th class="encabezado text-center">Bodega</th>
				<th class="encabezado text-center"></th>
				<!-- <th class="encabezado text-right">Total</th> -->
			</tr>
		</thead>
		<tbody>
			<?php $total = 0; foreach ($data as $key => $row): ?>
				<tr>
					<td class="cuerpo text-center" colspan="2"><?php echo formatoFecha($row["fecha"], 2)?></td>
					<td class="cuerpo text-left" colspan="2"><?php echo $row["egreso"]?></td>
					<td class="cuerpo text-center" colspan="1"><?php echo $row["estatus"]?></td>
					<td class="cuerpo text-center" colspan="1"><?php echo $row["nmovimiento"]?></td>
					<td class="cuerpo text-center" colspan="2"><?php echo $row["nbodega"]?></td>					
				</tr>
				<tr>
					<td class="encabezado cuerpo text-center"></td>
					<td class="encabezado cuerpo text-center"><b>Código</b></td>
					<td class="encabezado cuerpo text-left" colspan="2"><b>Articulo</b></td>
					<td class="encabezado cuerpo text-left" colspan="2"><b>Presentación</b></td>
					<td class="encabezado cuerpo text-right"><b>Cantidad</b></td>
					<td class="encabezado cuerpo text-right"><b>Total</b></td>
				</tr>
				<?php $tmpTotal = 0; foreach ($row["detalle"] as $llave => $fila): $tmpTotal+=$fila->precio_total; $total+=$fila->precio_total; ?>
					<tr>
						<td class="cuerpo"><br></td>
						<td class="cuerpo text-center"><?php echo $fila->carticulo?></td>
						<td class="cuerpo text-left" colspan="2"><?php echo $fila->narticulo?></td>
						<td class="cuerpo text-left" colspan="2"><?php echo $fila->npresentacion?></td>
						<td class="cuerpo text-right"><?php echo number_format($fila->cantidad, 2)?></td>
						<td class="cuerpo text-right"><?php echo number_format($fila->precio_total, 2)?></td>
					</tr>
				<?php endforeach ?>
				<tr>
					<td  colspan="7" class="totales text-right sborder"><b>Total documento:</b></td>
					<td class="totales text-right sborder"><b><?php echo number_format($tmpTotal, 2)?></b></td>
				</tr>
			<?php endforeach ?>
				<tr>
					<td  colspan="7" class="totales text-right sborder"><b>GRAN TOTAL:</b></td>
					<td class="gtotal text-right"><b><?php echo number_format($total, 2)?></b></td>
				</tr>
		</tbody>
	</table>
</body>
</html>
<style type="text/css">
	.table {
		display: table;
		width: 100%;
		max-width: 100%;
		border-collapse: collapse;
		border-spacing: 2px;
	}
	th {vertical-align: bottom; border-bottom: 1px solid black;}
	.encabezado { font-family: Arial, Helvetica, sans-serif; }
	.cuerpo { font-family: Arial, Helvetica, sans-serif; font-size: 11px;}
	.totales { vertical-align: middle; font-family: Arial, Helvetica, sans-serif; font-size: 11px; margin-bottom: 15px;}
	.gtotal { vertical-align: middle; border-top: 1px solid black; font-family: Arial, Helvetica, sans-serif; font-size: 11px;}
	.text-center {text-align: center;}
	.text-left {text-align: left;}
	.text-right {text-align: right;}
	.sborder {border: none;}
</style>