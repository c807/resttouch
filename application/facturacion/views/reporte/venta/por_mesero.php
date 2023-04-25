<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
	<title>Ventas por Categoría</title>
</head>

<body lang="es-GT" dir="ltr">
	<div class="row">
		<div class="col-sm-12 text-center">
			<h3>Reporte de ventas</h3>
			<?php if (isset($turno)) : ?>
				<h4>Turno: <?php echo $turno->descripcion ?> </h4>
			<?php endif ?>
			<span>Por mesero</span>
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
	<br /><br />
	<div class="row">
		<div class="col-sm-12">
			<?php foreach ($sedes as $s) : ?>
				<div class="table-responsive">
					<table class="table table-bordered" style="padding: 5px">
						<thead>
							<tr>
								<th colspan="4" calss="text-left" style="font-size: 14pt;">
									<?php echo $s->nombre ?>
								</th>
							</tr>
							<tr>
								<th style="padding: 5px;" class="text-center">Mesero</th>
								<th style="padding: 5px;" class="text-center">Artículo</th>
								<th style="padding: 5px;" class="text-center">Cantidad</th>
								<th style="padding: 5px;" class="text-center">Total (sin desct., sin propina)</th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ($s->ventas as $mesero) : ?>
								<?php $totalMesero = 0; ?>
								<tr>
									<td style="padding: 5px; font-weight: bold;"><?php echo "{$mesero->nombres} {$mesero->apellidos}" ?></td>
									<td style="padding: 5px; font-weight: bold;" class="text-right"></td>
									<td style="padding: 5px; font-weight: bold;" class="text-right"></td>
									<td style="padding: 5px; font-weight: bold;" class="text-right"></td>
								</tr>
								<?php foreach ($mesero->ventas as $venta) : ?>
									<tr>
										<td style="padding: 5px; margin-left: 5px; padding-left: 15px; font-weight: bold;"></td>
										<td style="padding: 5px;"><?php echo $venta->descripcion ?></td>
										<td style="padding: 5px;" class="text-right"><?php echo number_format((float)$venta->cantidad, 2) ?></td>
										<td style="padding: 5px;" class="text-right"><?php echo number_format((float)$venta->total, 2) ?></td>
										<?php $totalMesero += (float)$venta->total; ?>
									</tr>
								<?php endforeach ?>
								<tr>									
									<td style="padding: 5px; font-weight: bold;" class="text-right" colspan="3">Total de <?php echo "{$mesero->nombres} {$mesero->apellidos}" ?> (sin desct., sin propina):</td>
									<td style="padding: 5px; font-weight: bold;" class="text-right"><?php echo number_format((float)$totalMesero, 2) ?></td>
								</tr>
							<?php endforeach ?>
						</tbody>
						<tfoot>
							<!-- <tr>
								<td style="padding: 5px; margin-left: 5px; font-weight: bold" class="text-right">Sub-total de <?php echo $s->nombre ?> (sin descuentos):</td>
								<td style="padding: 5px; font-weight: bold" class="text-right"><?php echo number_format($s->cantidad, 2) ?></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"><?php echo number_format($s->total, 2) ?></td>
							</tr>
							<tr>
								<td style="padding: 5px; margin-left: 5px; font-weight: bold" class="text-right">Descuentos de <?php echo $s->nombre ?>:</td>
								<td style="padding: 5px; font-weight: bold" class="text-right"></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"><?php echo number_format($s->suma_descuentos, 2) ?></td>
							</tr>
							<tr>
								<td style="padding: 5px; margin-left: 5px; font-weight: bold" class="text-right">Sub-total de <?php echo $s->nombre ?> (con descuentos):</td>
								<td style="padding: 5px; font-weight: bold" class="text-right"></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"><?php echo number_format((float)$s->total - (float)$s->suma_descuentos, 2) ?></td>
							</tr>
							<tr>
								<td style="padding: 5px; margin-left: 5px; font-weight: bold" class="text-right">Propinas de <?php echo $s->nombre ?>:</td>
								<td style="padding: 5px; font-weight: bold" class="text-right"></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"><?php echo number_format($s->suma_propinas, 2) ?></td>
							</tr>
							<tr>
								<td style="padding: 5px; margin-left: 5px; font-weight: bold" class="text-right">Total de <?php echo $s->nombre ?> (Ingresos):</td>
								<td style="padding: 5px; font-weight: bold" class="text-right"></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"></td>
								<td style="padding: 5px; font-weight: bold" class="text-right"><?php echo number_format((float)$s->total - (float)$s->suma_descuentos + (float)$s->suma_propinas, 2) ?></td>
							</tr> -->
						</tfoot>
					</table>
				</div>
			<?php endforeach ?>
		</div>
	</div>
	<div>
		<span>NOTA: Los ingresos por ventas con factura deben tener firma electrónica para que se vean reflejados.</span>
	</div>
</body>
</body>

</html>