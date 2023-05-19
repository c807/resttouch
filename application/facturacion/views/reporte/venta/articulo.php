<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
	<title>Articulo</title>
</head>

<body lang="es-GT" dir="ltr">
	<div class="row">
		<div class="col-sm-12 text-center">
			<h3>Reporte de ventas</h3>
			<?php if (isset($turno)) : ?>
				<h4>Turno: <?php echo $turno->descripcion ?> </h4>
			<?php endif ?>
			<span>Por Artículo<?php echo ($_wms ? ' (comparativo par WMS)' : '') ?></span>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-12 text-center">
			<span><b>Del:</b> <?php echo formatoFecha($fdel, 2) ?> <b>al:</b> <?php echo formatoFecha($fal, 2) ?></span>
		</div>
	</div>
	<?php if (isset($_titulocc)) : ?>
		<div class="row">
			<div class="col-sm-12 text-center">
				<span><?php echo $_titulocc ?></span>
			</div>
		</div>
	<?php endif ?>
	<br />
	<?php foreach ($sedes as $sede) : ?>
		<div class="table-responsive">
			<table class="table table-bordered" style="padding: 5px">
				<thead>
					<tr>
						<?php $col = $_wms ? 4 : 3 ?>
						<th colspan="<?php echo $col ?>" style="padding: 5px;" class="text-center"><?php echo $sede->nombre ?></th>
					</tr>
					<tr>
						<th style="padding: 5px;" class="text-center">Descripción</th>
						<th style="padding: 5px;" class="text-right">Cantidad</th>
						<?php if ($_wms) : ?>
							<th style="padding: 5px;" class="text-right">Presentación</th>
						<?php endif ?>
						<th style="padding: 5px;" class="text-right">Total (sin desct., sin propina)</th>
					</tr>
				</thead>
				<tbody>
					<?php $totalSede = 0 ?>
					<?php foreach ($sede->ventas as $det) : ?>
						<?php $totalSede += (float)$det->total ?>
						<tr>
							<td style="padding: 5px;">
								<?php echo $det->descripcion ?>
							</td>
							<td style="padding: 5px;" class="text-right">
								<?php echo number_format($det->cantidad, 2) ?>
							</td>
							<?php if ($_wms) : ?>
								<td style="padding: 5px;" class="text-right">
									<?php echo $det->presentacion ?>
								</td>
							<?php endif ?>
							<td style="padding: 5px;" class="text-right">
								<?php echo number_format((float)$det->total, 2) ?>
							</td>
						</tr>
					<?php endforeach ?>
				</tbody>
				<tfoot>
					<?php $col = $_wms ? 3 : 2 ?>
					<tr>
						<td style="padding: 5px;font-weight: bold;" colspan="<?php echo $col ?>" class="text-right">
							<b>Sub-total (sin descuentos):</b>
						</td>
						<td style="padding: 5px;" class="text-right">
							<?php echo number_format($totalSede, 2) ?>
						</td>
					</tr>
					<tr>
						<td style="padding: 5px;font-weight: bold;" colspan="<?php echo $col ?>" class="text-right">
							<b>Descuentos:</b>
						</td>
						<td style="padding: 5px;" class="text-right">
							<?php echo number_format($sede->suma_descuentos, 2) ?>
						</td>
					</tr>
					<tr>
						<td style="padding: 5px;font-weight: bold;" colspan="<?php echo $col ?>" class="text-right">
							<b>Sub-total (con descuentos):</b>
						</td>
						<td style="padding: 5px;" class="text-right">
							<?php echo number_format($totalSede - $sede->suma_descuentos, 2) ?>
						</td>
					</tr>

					<tr>
						<td style="padding: 5px;font-weight: bold;" colspan="<?php echo $col ?>" class="text-right">
							<b>Propinas:</b>
						</td>
						<td style="padding: 5px;" class="text-right">
							<?php echo number_format($sede->suma_propinas, 2) ?>
						</td>
					</tr>
					<tr>
						<td style="padding: 5px;font-weight: bold;" colspan="<?php echo $col ?>" class="text-right">
							<b>Total (Ingresos):</b>
						</td>
						<td style="padding: 5px;" class="text-right">
							<?php echo number_format($totalSede - $sede->suma_descuentos + $sede->suma_propinas, 2) ?>
						</td>
					</tr>
				</tfoot>
			</table>
		</div>
	<?php endforeach; ?>
	<div>
		<span>NOTA: Los ingresos por ventas con factura deben tener firma electrónica para que se vean reflejados.</span>
	</div>
</body>

</html>