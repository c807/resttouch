<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Resumen de pedidos por proveedor</title>
</head>
<body lang="es-GT" dir="ltr">
	<p class="text-center"><b>Resumen de pedidos por proveedor</b></p>
	<table style="width: 100%;" class="sborder">
		<tr>
			<td class="sborder td-title-width"><b>Sede:</b></td>
			<td class="sborder"><?php echo "{$params['datos_sede']->nombre} ({$params['datos_sede']->alias})"?></td>
		</tr>
		<tr>			
			<td class="sborder" colspan="2"><b><?php echo "Las existencias se calculan con base en la bodega: {$params['datos_bodega']->descripcion}"?></b></td>
		</tr>
		<tr>
			<td class="sborder td-title-width"><b>Del:</b></td>
			<td class="sborder"><?php echo formatoFecha($params["fdel"], 2)?></td>
		</tr>
		<tr>
			<td class="sborder td-title-width"><b>Al:</b></td>
			<td class="sborder"><?php echo formatoFecha($params["fal"], 2)?></td>
		</tr>
	</table>
	<br>
		<table>
			<tbody>
				<?php $total = 0; foreach ($data as $key => $row): ?>
					<tr>
						<td><?php echo $row->orden_compra?></td>
						<td><?php echo $row->fhcreacion?></td>
						<td><?php echo $row->usuario?></td>
						<td><?php echo $row->proveedor?></td>
						<td><?php echo $row->estatus?></td>
						<td colspan="3"><?php echo $row->ingreso?></td>
					</tr>
					<tr>
						<td colspan="8"><?php echo $row->notas?></td>
					</tr>
					<tr>
						<td class="sborder"><br></td>
						<td class="titulo">Código</td>
						<td class="titulo">Descripción</td>
						<td class="titulo">Presentación</td>
						<td class="titulo text-right">Existencias</td>
						<td class="titulo text-right">Cantidad</td>
						<td class="titulo text-right">Costo U.</td>
						<td class="titulo text-right">Total</td>
					</tr>
					<?php $tmpTotal = 0; foreach ($row->detalle as $llave => $fila): $tmpTotal+= $fila->total; $total+= $fila->total; ?>
						<tr>
							<td class="sborder"><br></td>
							<td><?php echo $fila->codigo?></td>
							<td><?php echo $fila->articulo?></td>
							<td><?php echo $fila->presentacion?></td>
							<td class="text-right"><?php echo number_format($fila->existencias, 2)?></td>
							<td class="text-right"><?php echo number_format($fila->cantidad, 2)?></td>
							<td class="text-right"><?php echo number_format($fila->monto, 2)?></td>
							<td class="text-right"><?php echo number_format($fila->total, 2)?></td>
						</tr>
					<?php endforeach ?>
					<tr>
						<td colspan="7" class="totales">Total</td>
						<td colspan="1" class="totales"><?php echo number_format($tmpTotal, 2)?></td>
					</tr>
					<tr>
						<td colspan="8" class="sborder"><br></td>
					</tr>
				<?php endforeach ?>
				<tr>
					<td colspan="7" class="totales">Total</td>
					<td colspan="1" class="totales"><?php echo number_format($total, 2)?></td>
				</tr>
			</tbody>
		</table>
	
</body>
</html>
<style type="text/css">
	body {font-family: sans-serif;}
	table {width: 100%; border-collapse: collapse; border: 1px solid black; padding: 5px;}
	td { border-collapse: collapse; border: 1px solid black;}
	
	.text-right {text-align: right;}
	.text-center {text-align: center;}
	.tabla-contenido {font-size: 0.65em;}
	.tabla-firma {font-size: 0.90em;}
	.tabla-firma-td {border: none; text-align:center;padding: 15px 1px 15 1px;}
	.titulo {text-align: center; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
	.totales {text-align: right; background-color: #E5E5E5; }
	.sborder {border: none;}
	.td-title-width {width: 7%;}
</style>