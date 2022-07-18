<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Ventas por Marca</title>
</head>
<body lang="es-GT" dir="ltr">
	<table style="width: 100%;" class="sborder">
		<tr>
			<td class="sborder text-center"><h2>Ventas por Marca</h2></td>
		</tr>
		<tr>
			<td class="sborder text-center"><b>Del: </b> <?php echo formatoFecha($params["fdel"], 2)?> <b>Al: </b> <?php echo formatoFecha($params["fal"], 2)?></td>
		</tr>
	</table>
	<br>
	<?php
		$total  = 0;
		$ultimo = count($data) - 1;
		foreach ($data as $key => $row):
			$tmpSede = new Sede_model($key);

			usort($row, function($a, $b) {
				return $a["total"] - $b["total"];
			});
	?>
		<table>
			<thead>
				<tr>
					<th class="totales cborde" style="text-align: left; width: 50%;">Marca</th>
					<th class="totales cborder text-right" style="width: 50%;">Total</th>
				</tr>
				<tr>
					<th class="titulo cborder text-center" colspan="2" style="text-align: left;width: 100%;"><?php echo "{$tmpSede->nombre} ({$tmpSede->alias})"?></th>
				</tr>
			</thead>
			<tbody>
				<?php
					$tmpTotal = 0;
					foreach ($row as $llave => $fila):
						$tmpTotal += $fila["total"];
						$total    += $fila["total"];
				?>
					<tr>
						<td style="width: 50%;"><?php echo $fila["nombre"]?></td>
						<td class="text-right" style="width: 50%;"><?php echo number_format($fila["total"], 2)?></td>
					</tr>
				<?php endforeach ?>
				<tr>
					<td class="totales text-right" style="width: 50%;"><b>Total</b></td>
					<td class="totales text-right" style="width: 50%;"><b><?php echo number_format($tmpTotal, 2)?></b></td>
				</tr>
				<?php if ($ultimo == $key): ?>
					<tr>
						<td class="totales text-right" style="width: 50%;"><b>Gran Total</b></td>
						<td class="totales text-right" style="width: 50%;"><b><?php echo number_format($total, 2)?></b></td>
					</tr>
				<?php endif ?>
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
	.cborder {border: 1px solid black;}
</style>