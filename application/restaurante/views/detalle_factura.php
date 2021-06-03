<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
  	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
	<title>Detalle Facturas</title>
</head>

<body lang="es-GT" dir="ltr">
	<div class="row">
		<div class="col-sm-12">
			<table style="width: 100%;">
				<tr>
					<td><?php echo $empresa->nombre ?></td>
				</tr>
				<tr>
					<td><?php echo $sede->nombre ?></td>
				</tr>
			</table>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-12 text-center">
			<h2>Detalle de Facturas</h2>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-12 text-center">
			<h5><b>Del:</b> <?php echo formatoFecha($fdel,2) ?> <b>al:</b> <?php echo formatoFecha($fal,2) ?></h5>
		</div>
	</div>
	<br>
	<div class="row">
		<div class="col-sm-3">
			<span>Facturas</span><br>
			<span>FEL</span>
		</div>
	</div>
	<br>
	<div class="row">
		<div class="col-sm-12">
			<div class="table-responsive">
				<table class="table table-bordered" style="padding: 5px">
					<thead>
						<tr>
							<th style="padding: 5px;" class="text-center">Factura</th>
							<th style="padding: 5px;" class="text-center">Mesa</th>
							<th style="padding: 5px;" class="text-center">Fecha</th>
							<th style="padding: 5px;" class="text-center">NIT</th>
							<th style="padding: 5px;" class="text-center">Cliente</th>
							<?php if ($impuesto_especial): ?>
								<th style="padding: 5px;" class="text-center">
									Impuesto Especial
								</th>	
							<?php endif ?>
							<?php if (isset($_anuladas) && filter_var($_anuladas, FILTER_VALIDATE_BOOLEAN)): ?>
								<th style="padding: 5px;" class="text-center">Fecha de anulación</th>
								<th style="padding: 5px;" class="text-center">Usuario que anuló</th>
								<th style="padding: 5px;" class="text-center">Motivo</th>
							<?php endif ?>
							<th style="padding: 5px;" class="text-center">Total</th>
							<th style="padding: 5px;" class="text-center">Propina</th>
							<th style="padding: 5px;" class="text-center">Descuento</th>
						</tr>
					</thead>
					<tbody>
						<?php 
							$totalFactura = 0;
							$totalPropina = 0;
							$totalDescuento = 0;
						?>
						<?php foreach ($facturas as $row): ?>
							<?php 
								$detalle = $row->getDetalle();
								$total = suma_field($detalle, "total");
								$imp = suma_field($detalle, "valor_impuesto_especial");
								$total += $imp;
							?>
							<tr>
								<td style="padding: 5px;">
									<?php echo $row->numero_factura ?>
								</td>
								<td style="padding: 5px;" class="text-center">
									<?php echo isset($row->mesa->mesa) ? $row->mesa->mesa : '' ?>
								</td>
								<td style="padding: 5px;"><?php echo formatoFecha($row->fecha_factura,2) ?></td>
								<td style="padding: 5px;">
									<?php echo (empty($row->fel_uuid_anulacion) ? $row->receptor->nit : '') ?>
								</td>
								<td style="padding: 5px;">
									<?php echo (empty($row->fel_uuid_anulacion) ? $row->receptor->nombre : 'ANULADA') ?>
								</td>
								<?php if ($impuesto_especial): ?>
									<td style="padding: 5px;" class="text-right">
										<?php echo (empty($row->fel_uuid_anulacion) ? 
										number_format($imp, 2) : 0) ?>
									</td>	
								<?php endif ?>
								<?php if (isset($_anuladas) && filter_var($_anuladas, FILTER_VALIDATE_BOOLEAN)): ?>
									<td style="padding: 5px;" class="text-center">
										<?php echo formatoFecha($row->bitacora->fecha) ?>
									</td>
									<td style="padding: 5px;" class="text-center">
										<?php echo "{$row->bitacora->usuario->nombres} {$row->bitacora->usuario->apellidos}" ?>
									</td>
									<td style="padding: 5px;" class="text-center">
										<?php echo isset($row->razon_anulacion->descripcion) ? $row->razon_anulacion->descripcion : '' ?>
									</td>
								<?php endif ?>
								<td style="padding: 5px;" class="text-right">
									<?php echo (empty($row->fel_uuid_anulacion) ? 
										number_format($total, 2) : 0) ?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php 
										if (empty($row->fel_uuid_anulacion)) {
											echo number_format($row->propina, 2);
											$totalPropina += $row->propina;
										} else {
											echo 0;
										}
									?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php 
										if (empty($row->fel_uuid_anulacion)) {
											$desc = suma_field($detalle, "descuento");
											echo number_format($desc, 2);
											$totalDescuento += $desc;
											$totalFactura += ($total - $desc);
										} else {
											echo "0.00";
										}
									 ?>
								</td>
								
							</tr>
							<?php if (isset($_detalle) && $_detalle !== "false"): ?>
								<tr>
									<td class="text-center" colspan="3"></td>
									<td class="text-center">Artículo</td>
									<td class="text-center">Cantidad</td>
									<?php if ($impuesto_especial): ?>
										<td class="text-center">
											Impuesto Especial
										</td>
									<?php endif ?>
									<td class="text-center">Total</td>
									<td class="text-center">Descuento</td>
								</tr>
								<?php foreach ($detalle as $det): ?>
									<?php 
										$col = 3;
										if ($impuesto_especial) {
											$col = 2;
										}
									 ?>
									<tr>
										<td colspan="<?php echo $col ?>"></td>
										<td style="padding: 5px;"><?php echo $det->articulo->descripcion ?></td>
										<td style="padding: 5px;" class="text-center"><?php echo $det->cantidad ?></td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format($det->total,2) ?></td>
										<?php if ($det->impuesto_especial): ?>
											<td style="padding: 5px;" class="text-right">
												<span>
													<?php echo $det->impuesto->descripcion ?>
												</span><br>
												<?php echo number_format($det->valor_impuesto_especial,2) ?>
											</td>
										<?php else: ?>
											<?php echo number_format(0, 2) ?>
										<?php endif ?>
										<td style="padding: 5px;"></td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format($det->descuento+$det->valor_impuesto_especial,2) ?>
										</td>
									</tr>
								<?php endforeach ?>
							<?php endif ?>
						<?php endforeach ?>
					</tbody>
					<tfoot>
						<?php 
							$col = 5;
							if (isset($_anuladas) && filter_var($_anuladas, FILTER_VALIDATE_BOOLEAN)) {
								$col += 3;
							}

							if ($impuesto_especial) {
								$col += 1;
							}
						 ?>
						<tr>
							<td colspan="<?php echo $col ?>" style="padding: 5px;" class="text-right">Total:</td>
							<td style="padding: 5px;" class="text-right"><?php echo number_format($totalFactura,2) ?></td>
							<td style="padding: 5px;" class="text-right"><?php echo number_format($totalPropina,2) ?></td>
							<td style="padding: 5px;" class="text-right"><?php echo number_format($totalDescuento, 2) ?></td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	</div>
</body>
</body>
</html>