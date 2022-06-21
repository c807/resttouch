<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Resumen de consumos por articulo</title>
</head>
<body lang="es-GT" dir="ltr">
	<h3 class="text-center encabezado" style="border-bottom: 1px solid black; padding-bottom: 5px;">Resumen de consumos por articulo</h3>
	<div class="encabezado" style="border: 1px solid black; padding: 2.5px; border-radius: 10px;">

		<p style="margin: 1px auto 1px;"><b>Del: </b> <?php echo formatoFecha($params["fdel"], 2)?> <b>Al: </b> <?php echo formatoFecha($params["fal"], 2)?></p>
		<p style="margin: 1px auto 1px;"><b>Sede: </b> <?php echo "{$sede->nombre} - {$sede->alias}"?></p>
		<?php if (verDato($params, "grupo_nombre")): ?>
			<p style="margin: 1px auto 1px;"><b>Subcategoria: </b> <?php echo $params["grupo_nombre"]?></p>
		<?php endif ?>
	</div><br>
	<table class="tabla-contenido">
		<thead>
			<tr>
				<th class="titulo text-left">Código</th>
				<th class="titulo text-left">Articulo</th>
				<th class="titulo text-right">Cantidad</th>
				<th class="titulo text-left">Unidad</th>
				<th class="titulo text-right">Costo</th>
				<th class="titulo text-right">Total</th>
			</tr>
		</thead>
		<tbody>
			<?php $total = 0; foreach ($data as $key => $row): $total+=$row["total"]; ?>
				<tr>
					<td class="cuerpo text-left"><?php echo $row["codigo"] ?></td>
					<td class="cuerpo text-left"><?php echo $row["articulo"] ?></td>
					<td class="cuerpo text-right"><?php echo number_format($row["cantidad"], 2) ?></td>
					<td class="cuerpo text-left"><?php echo $row["unidad"] ?></td>
					<td class="cuerpo text-right"><?php echo number_format($row["costo"], 2) ?></td>
					<td class="cuerpo text-right"><?php echo number_format($row["total"], 2) ?></td>
				</tr>
			<?php endforeach ?>
			<tr>
				<td class="totales" colspan="5">Total</td>
				<td class="totales"><?php echo number_format($total, 2)?></td>
			</tr>
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