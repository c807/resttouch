<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
  	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
	<title>Categoria</title>
</head>

<body lang="es-GT" dir="ltr">
	<div class="row">
		<div class="col-sm-12">
			<table style="width: 100%;">
				<tr>
					<td><?php echo $empresa->nombre ?></td>
				</tr>
				<tr>
					<td><?php echo "Sede: {$nsede}" ?></td>
				</tr>
				<?php if(isset($_titulocc)): ?>
					<tr>
						<td><?php echo $_titulocc ?></td>
					</tr>
				<?php endif ?>
			</table>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-12 text-center">
			<h3>Reporte de ventas</h3>
			<?php if (isset($turno)): ?>
				<h4>Turno: <?php echo $turno->descripcion ?> </h4>
			<?php endif ?>
			<span>Por Categoría</span>
		</div>
	</div>
	
	<div class="row">
		<div class="col-sm-12 text-center">
			<span><b>Del:</b> <?php echo formatoFecha($fdel,2) ?> <b>al:</b> <?php echo formatoFecha($fal,2) ?></span>
		</div>
	</div>
	<br>
	
	<br>
	<div class="row">
		<div class="col-sm-12">
			<div class="table-responsive">
				<?php if (!isset($detalle['grupo'])): ?>
					<table class="table table-bordered" style="padding: 5px">
						<thead>
							<tr>
								<th style="padding: 5px;" class="text-center">Descripción</th>
								<th style="padding: 5px;" class="text-center">Cantidad</th>
								<th style="padding: 5px;" class="text-center">Porcentaje</th>
								<th style="padding: 5px;" class="text-center">Precio Unitario</th>
								<th style="padding: 5px;" class="text-center">Total</th>
							</tr>
						</thead>

						<?php $granTotal = 0; ?>

						<tbody>
							<?php foreach ($detalle as $det): ?>
								<tr>
									<td style="padding: 5px;"><b><?php echo $det->descripcion ?></b></td>
									<td style="padding: 5px;" class="text-right"></td>
									<td style="padding: 5px;" class="text-right"></td>
									<td style="padding: 5px;" class="text-right"></td>
									<td style="padding: 5px;" class="text-right"></td>
								</tr>
								<?php foreach ($det->subcategoria as $sub): ?>
									<?php if (count($sub['articulos']) > 0): ?>
										<tr>
											<td style="padding: 5px; margin-left: 5px;"><b><?php echo $sub['descripcion'] ?></b></td>
											<td style="padding: 5px;" class="text-right"></td>
											<td style="padding: 5px;" class="text-right"></td>
											<td style="padding: 5px;" class="text-right"></td>
											<td style="padding: 5px;" class="text-right"></td>
										</tr>
										<?php $total = 0 ?>
										<?php foreach ($sub['articulos'] as $row): ?>
											<tr>
												<td style="padding: 5px; margin-left: 10px;"><?php echo $row->descripcion ?></td>
												<td style="padding: 5px;" class="text-right"><?php echo $row->cantidad ?></td>
												<td style="padding: 5px;" class="text-right"><?php echo $row->porcentaje ?></td>
												<td style="padding: 5px;" class="text-right"><?php echo $row->precio_unitario ?></td>
												<td style="padding: 5px;" class="text-right"><?php echo number_format($row->total, 2) ?></td>
											</tr>	
											<?php 
												$total += $row->total;
												$granTotal += $row->total;
											?>	
										<?php endforeach ?>
										<tr>
											<td style="padding: 5px; margin-left: 5px;" class="text-right" colspan="4"><b>Total subcategoría</b></td>
											<td style="padding: 5px;" class="text-right">
												<?php echo number_format($total, 2) ?>
											</td>
										</tr>
									<?php endif ?>
								<?php endforeach ?>
							<?php endforeach ?>
						</tbody>
						<tfoot>
							<tr>
								<td style="padding: 5px; margin-left: 5px;" class="text-right" colspan="4">
									<h4>Total (con desct., sin propina):</h4>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php echo number_format($granTotal - $monto_descuento, 2) ?>
								</td>
							</tr>
							<tr>
								<td style="padding: 5px; margin-left: 5px;" class="text-right" colspan="4">
									<h4>Propinas:</h4>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php echo number_format($monto_propinas, 2) ?>
								</td>
							</tr>
							<tr>
								<td style="padding: 5px; margin-left: 5px;" class="text-right" colspan="4">
									<h4>Total (Ingresos):</h4>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php echo number_format($granTotal - $monto_descuento + $monto_propinas, 2) ?>
								</td>
							</tr>
						</tfoot>
					</table>
				<?php else: ?>
					<table class="table table-bordered" style="padding: 5px">
						<thead>
							<tr>
								<th style="padding: 5px;" class="text-center">Descripción</th>
								<th style="padding: 5px;" class="text-center">Cantidad</th>
								<th style="padding: 5px;" class="text-center">Porcentaje</th>
								<th style="padding: 5px;" class="text-center">Precio Unitario</th>
								<th style="padding: 5px;" class="text-center">Total</th>
							</tr>
						</thead>

						<?php $granTotal = 0; ?>

						<tbody>
							<?php foreach ($detalle['datos'] as $sede): ?>
								<?php $totalSede = 0 ?>
								<tr>
									<td style="padding: 5px; float: left;font-weight: bold;" colspan="5">
										<h4><?php echo $sede['sede'] ?></h4>
									</td>
								</tr>
							
								<?php foreach ($sede['articulos'] as $det): ?>
									<tr>
										<td style="padding: 5px;"><b><?php echo $det->descripcion ?></b></td>
										<td style="padding: 5px;" class="text-right"></td>
										<td style="padding: 5px;" class="text-right"></td>
										<td style="padding: 5px;" class="text-right"></td>
										<td style="padding: 5px;" class="text-right"></td>
									</tr>
									<?php foreach ($det->subcategoria as $sub): ?>
										<?php if (count($sub['articulos']) > 0): ?>
											<tr>
												<td style="padding: 5px; margin-left: 5px;"><b><?php echo $sub['descripcion'] ?></b></td>
												<td style="padding: 5px;" class="text-right"></td>
												<td style="padding: 5px;" class="text-right"></td>
												<td style="padding: 5px;" class="text-right"></td>
												<td style="padding: 5px;" class="text-right"></td>
											</tr>
											<?php $total = 0 ?>
											<?php foreach ($sub['articulos'] as $row): ?>
												<tr>
													<td style="padding: 5px; margin-left: 10px;"><?php echo $row->descripcion ?></td>
													<td style="padding: 5px;" class="text-right"><?php echo $row->cantidad ?></td>
													<td style="padding: 5px;" class="text-right"><?php echo $row->porcentaje ?></td>
													<td style="padding: 5px;" class="text-right"><?php echo $row->precio_unitario ?></td>
													<td style="padding: 5px;" class="text-right"><?php echo number_format($row->total, 2) ?></td>
												</tr>	
												<?php 
													$total += $row->total;
												?>	
											<?php endforeach ?>
											<?php $totalSede += $total; ?>
											<tr>
												<td style="padding: 5px; margin-left: 5px;" class="text-right" colspan="4"><b>Total subcategoría</b></td>
												<td style="padding: 5px;" class="text-right">
													<?php echo number_format($total, 2) ?>
												</td>
											</tr>
										<?php endif ?>
									<?php endforeach ?>
								<?php endforeach ?>
								<tr>
									<td colspan="4" class="text-right">
										Total Sede
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php echo number_format($totalSede, 2) ?>
									</td>
								</tr>
								<?php $granTotal += $totalSede; ?>
							<?php endforeach ?>
						</tbody>
						<tfoot>
							<tr>
								<td style="padding: 5px; margin-left: 5px;font-weight: bold;" class="text-right" colspan="4">
									<h4>Total (con desct., sin propina):</h4>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php echo number_format($granTotal - $monto_descuento, 2) ?>
								</td>
							</tr>
							<tr>
								<td style="padding: 5px; margin-left: 5px;" class="text-right" colspan="4">
									<h4>Propinas:</h4>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php echo number_format($monto_propinas, 2) ?>
								</td>
							</tr>
							<tr>
								<td style="padding: 5px; margin-left: 5px;" class="text-right" colspan="4">
									<h4>Total (Ingresos):</h4>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php echo number_format($granTotal - $monto_descuento + $monto_propinas, 2) ?>
								</td>
							</tr>							
						</tfoot>
					</table>
				<?php endif ?>
			</div>
		</div>
	</div>
</body>
</body>
</html>