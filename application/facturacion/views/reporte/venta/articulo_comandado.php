<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
		<title>Reporte de Ventas por Artículos Comandados</title>
		<style>
			.text-left { text-align: left; }
			.text-right { text-align: right; }
			.text-center { text-align: center; }
			.bold { font-weight: bold; }
		</style>
	</head>
	<body lang="es-GT" dir="ltr">
		<div class="row">
			<div class="col-sm-12 text-center">
				<h3>Ventas por Artículos Comandados</h3>
				<!-- <h4>Turno: <?php echo $turno; ?></h4> -->
			</div>
		</div>

		<div class="row">
			<div class="col-sm-12 text-center">
				<span><b>Del:</b> <?php echo $fdel; ?> <b>al:</b> <?php echo $fal; ?></span>
			</div>
		</div>
		<br />
			<div class="table-responsive">
				<table class="table table-bordered" style="padding: 5px">
					<thead>
							<tr>
								<th style="padding: 5px;" class="text-center">Sede</th>
								<th style="padding: 5px;" class="text-center">Descripción</th>
								<th style="padding: 5px;" class="text-center">Comanda</th>
								<th style="padding: 5px;" class="text-center">Cantidad</th>
								<th style="padding: 5px;" class="text-center">Total (sin desct., sin propina)</th>
							</tr>
						</thead>
						<tbody>
							<?php $totalGeneral = 0; ?>
								<?php foreach ($data as $detalle) : ?>
									<tr>
										<td style="padding: 5px;" class="text-left"><?php echo $detalle->sede; ?></td>
										<td style="padding: 5px;" class="text-left"><?php echo $detalle->articulo; ?></td>
										<td style="padding: 5px;" class="text-right"><?php echo $detalle->comanda; ?></td>
										<td style="padding: 5px;" class="text-right"><?php echo number_format($detalle->cantidad, 2); ?></td>
										<td style="padding: 5px;" class="text-right"><?php echo number_format($detalle->total, 2); ?></td>
									</tr>
								<?php $totalGeneral += $detalle->total; ?>
							<?php endforeach; ?>
						</tbody>
						<tfoot>
							<tr>
								<td style="padding: 5px;" colspan="4" class="text-right bold"><b>Total General:</b></td>
								<td style="padding: 5px;" class="text-right"><?php echo number_format($totalGeneral, 2); ?></td>
							</tr>
						</tfoot>
					</table>
				</div>
			<div>
					<span>NOTA: Ventas con base a lo comandado y no a lo facturado</span>
			</div>
	</body>
</html>

