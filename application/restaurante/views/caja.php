<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
	<title>Reporte Caja</title>
</head>

<body lang="es-GT" dir="ltr">
	<div class="row">
		<div class="col-sm-12">
			<table style="width: 100%;">
				<tr>
					<td style="font-weight: bold;"><?php echo $empresa->nombre ?></td>
				</tr>
				<tr>
					<td style="font-weight: bold;"><?php echo $nsede ?></td>
				</tr>
			</table>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-12 text-center">
			<h2>Reporte de Caja</h2>
			<?php if (isset($detalle)) : ?>
				<h3>--Detalle--</h3>
			<?php else : ?>
				<h3>--Resumen--</h3>
			<?php endif ?>
			<?php if (isset($turno)) : ?>
				<h4>Turno: <?php echo $turno->descripcion ?> </h4>
			<?php endif ?>
		</div>
	</div>
	<?php
	$recIng = 0;
	$recDesc = 0;
	?>
	<div class="row">
		<div class="col-sm-12 text-center">
			<h5>
				<b>Del:</b>
				<?php echo formatoFecha($fdel, 2) ?>
				<b>al:</b>
				<?php echo formatoFecha($fal, 2) ?>
			</h5>
		</div>
	</div>
	<br>

	<br>
	<div class="row">		
		<div class="col-sm-12">
			<div class="table-responsive">
				<table class="table table-bordered" style="padding: 5px">
					<thead>
						<tr>
							<th style="padding: 5px;" class="text-center">Descripcion</th>
							<th style="padding: 5px;" class="text-center">Monto</th>
							<th style="padding: 5px;" class="text-center">Propina</th>
							<th style="padding: 5px;" class="text-center">Total</th>
							<?php if ($_validar) : ?>
								<th style="padding: 5px;" class="text-center">Monto Recibido</th>
								<th style="padding: 5px;" class="text-center">Diferencia</th>
							<?php endif ?>
						</tr>
					</thead>
					<tbody>
						<?php if (!isset($_grupo) || $_grupo == 1) : ?>
							<tr>
								<td style="padding: 10px;" colspan="3"><b>Ingresos</b></td>
							</tr>
							<?php foreach ($ingresos as $row) : ?>								
								<tr>
									<td style="padding: 5px;"><?php echo $row->descripcion ?></td>
									<td style="padding: 5px;" class="text-right">
										<?php echo number_format($row->monto, 2) ?>
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php echo number_format($row->propina, 2) ?>
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php echo (((float)$row->propina + (float)$row->monto) !== (float)0) ? number_format($row->propina + $row->monto, 2) : "0.00" ?>
									</td>
									<?php if ($_validar) : ?>
										<td style="padding: 5px;" class="text-right">
											<?php
											$rec = isset($pagos[$row->forma_pago]) ? $pagos[$row->forma_pago] : 0;
											$recIng += $rec;
											echo number_format($rec, 2)
											?>
										</td>
										<?php
										$clase = "";
										$ing = $row->monto + $row->propina;
										// $dif = abs($ing -$rec);
										$dif = $ing - $rec;
										// if ($dif > 0) {
										if ($dif < 0) {
											$clase = "color:#bd2130";
										}
										?>
										<td style='<?php echo "padding: 5px; {$clase}" ?>' class="text-right">
											<?php
											// echo number_format($dif, 2);
											echo number_format(abs($dif), 2);
											?>
										</td>
									<?php endif ?>
								</tr>
							<?php endforeach ?>
							<?php if ($_validar) : ?>
								<!-- hasta aqui-->
								<?php foreach ($ingreso_sin_fact as $row) : ?>									
									<tr>
										<td style="padding: 5px;"><?php echo $row->descripcion ?></td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format(0.00, 2) ?>
										</td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format(0.00, 2) ?>
										</td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format(0.00, 2) ?>
										</td>
										<td style="padding: 5px;" class="text-right">
											<?php
											$rec = isset($pagos[$row->forma_pago]) ? $pagos[$row->forma_pago] : 0;
											$recIng += $rec;
											echo number_format($rec, 2)
											?>
										</td>
										<?php
										$clase = "";
										$ing = 0;
										// $dif = abs($ing -$rec);
										$dif = $ing - $rec;
										// if ($dif > 0) {
										if ($dif < 0) {
											$clase = "color:#bd2130";
										}
										?>
										<td style='<?php echo "padding: 5px; {$clase}" ?>' class="text-right">
											<?php
											echo number_format(abs($dif), 2);
											?>
										</td>
									</tr>
								<?php endforeach ?>
							<?php endif ?>
							<tr>
								<td style="padding: 5px;" class="text-right">
									<b>Total Ingresos:</b>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									$ing = suma_field($ingresos, "monto");
									echo number_format($ing, 2);
									?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									$prop = suma_field($ingresos, "propina");
									echo number_format($prop, 2);
									?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									echo number_format($prop + $ing, 2);
									?>
								</td>
								<?php if ($_validar) : ?>
									<td style="padding: 5px;" class="text-right">
										<?php
										$clase = '';
										// if ($recIng > 0) {
										if ($recIng < 0) {
											$clase = " color:#bd2130";
										}
										echo number_format($recIng, 2);
										?>
									</td>
									<td style='<?php echo "padding: 5px; {$clase}" ?>' class="text-right">
										<?php
										echo number_format(abs($ing + $prop - $recIng), 2);
										?>
									</td>
								<?php endif ?>
							</tr>
							<tr>
								<td style="padding: 10px;" colspan="3"><b>Descuentos</b></td>
							</tr>
							<?php foreach ($descuentos as $row) : ?>								
								<tr>
									<td style="padding: 5px;"><?php echo $row->descripcion ?></td>
									<td style="padding: 5px;" class="text-right">
										<?php echo $row->monto ?>
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php echo $row->propina ?>
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php echo number_format($row->monto + $row->propina, 2) ?>
									</td>
									<?php if ($_validar) : ?>
										<td style="padding: 5px;" class="text-right">
											<?php
											$rec = isset($pagos[$row->forma_pago]) ? $pagos[$row->forma_pago] : 0;
											$recDesc += $rec;
											echo number_format($rec, 2)
											?>
										</td>
										<?php
										$clase = "";
										// $dif = abs($row->monto - $rec);
										$dif = $row->monto + $row->propina - $rec;
										if ($dif < 0) {
											$clase = "color:#bd2130";
										}
										?>
										<td style='<?php echo "padding: 5px; {$clase}" ?>' class="text-right">
											<?php
											echo number_format(abs($dif), 2);
											?>
										</td>
									<?php endif ?>
								</tr>
							<?php endforeach ?>
							<?php if ($_validar) : ?>
								<?php foreach ($descuento_sin_fact as $row) : ?>									
									<tr>
										<td style="padding: 5px;"><?php echo $row->descripcion ?></td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format(0.00, 2) ?>
										</td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format(0.00, 2) ?>
										</td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format(0.00, 2) ?>
										</td>
										<?php if ($_validar) : ?>
											<td style="padding: 5px;" class="text-right">
												<?php
												$rec = isset($pagos[$row->forma_pago]) ? $pagos[$row->forma_pago] : 0;
												$recDesc += $rec;
												echo number_format($rec, 2)
												?>
											</td>
											<?php
											$clase = "";
											// $dif = abs(0 - $rec);
											$dif = 0 - $rec;
											if ($dif > 0) {
												$clase = "color:#bd2130";
											}
											?>
											<td style='<?php echo "padding: 5px; {$clase}" ?>' class="text-right">
												<?php
												echo number_format(abs($dif), 2);
												?>
											</td>
										<?php endif ?>
									</tr>
								<?php endforeach ?>
							<?php endif ?>
							<tr>
								<td style="padding: 5px;" class="text-right"><b>Total Descuentos:</b></td>
								<td style="padding: 5px;" class="text-right">
									<?php
									$desc = suma_field($descuentos, "monto");
									echo number_format(abs($desc), 2);
									?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									$prop_desc = suma_field($descuentos, "propina");
									echo number_format(abs($prop_desc), 2);
									?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									echo number_format(abs($desc + $prop_desc), 2);
									?>
								</td>
								<?php if ($_validar) : ?>
									<td style="padding: 5px;" class="text-right">
										<?php
										$clase = '';
										// if ($recDesc > 0) {
										if (($desc + $prop_desc - $recDesc) < 0) {
											$clase = " color:#bd2130";
										}
										echo number_format($recDesc, 2);
										?>
									</td>
									<td style='<?php echo "padding: 5px; {$clase}" ?>' class="text-right">
										<?php
										echo number_format(abs($desc + $prop_desc - $recDesc), 2);
										?>
									</td>
								<?php endif ?>
							</tr>
							<tr>
								<td style="padding: 5px;" class="text-right"><b>TOTAL:</b></td>
								<td style="padding: 5px;" class="text-right">
									<?php echo number_format(($desc + $ing), 2) ?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php echo number_format($prop + $prop_desc, 2) ?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php echo number_format(($desc + $ing + $prop + $prop_desc), 2) ?>
								</td>
								<?php if ($_validar) : ?>
									<td style="padding: 5px;" class="text-right">
										<?php
										$clase = '';
										// if ($recIng > 0 || $recDesc > 0) {
										if ($recIng < 0 || $recDesc < 0 || ($ing + $prop + $prop_desc + $desc - ($recIng + $recDesc)) < 0) {
											$clase = " color:#bd2130";
										}
										echo number_format($recIng + $recDesc, 2);
										?>
									</td>
									<td style='<?php echo "padding: 5px; {$clase}" ?>' class="text-right">
										<?php
										echo number_format(abs($ing + $prop + $prop_desc + $desc - ($recIng + $recDesc)), 2);
										?>
									</td>
								<?php endif ?>
							</tr>
							<!-- Inicia fila de comensales -->
							<tr>
								<td style="padding: 5px;" class="text-right"><b>COMENSALES:</b></td>
								<td style="padding: 5px;" class="text-right"><?php echo $totalComensales ?></td>
								<td style="padding: 5px;" class="text-right">CONSUMO/COMENSAL:</td>
								<td style="padding: 5px;" class="text-right"><?php echo number_format($totalComensales > 0 ? (($desc + $ing + $prop + $prop_desc) / $totalComensales) : 0, 2) ?></td>
								<?php if ($_validar) : ?>
									<td style="padding: 5px;" class="text-right"></td>
									<td style='<?php echo "padding: 5px; {$clase}" ?>' class="text-right"></td>
								<?php endif ?>
							</tr>
							<!-- Termina fila de comensales -->
						<?php else : ?>
							<?php $totalIngresos = 0; ?>
							<?php $totalDescuentos = 0; ?>
							<?php $totalPropinas = 0; ?>
							<?php $totalPropDescuentos = 0; ?>
							<?php foreach ($ingresos as $value) : ?>
								<tr>
									<td colspan="3" style="padding: 5px; font-weight: bold;">
										<h4><?php echo $value[0]->nsede ?></h4>
									</td>
								</tr>
								<tr>
									<td colspan="3" style="padding: 5px;">
										<b>Ingresos</b>
									</td>
								</tr>
								<?php foreach ($value as $row) : ?>
									<tr>
										<td style="padding: 5px;"><?php echo $row->descripcion ?></td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format($row->monto, 2) ?>
										</td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format($row->propina, 2) ?>
										</td>

										<td style="padding: 5px;" class="text-right">
											<?php echo number_format($row->propina + $row->monto, 2) ?>
										</td>

										<?php if ($_validar) : ?>
											<td style="padding: 5px;" class="text-right">
												<?php
												$rec = isset($pagos[$row->forma_pago]) ? $pagos[$row->forma_pago] : 0;
												$recIng += $rec;
												echo number_format($rec, 2)
												?>
											</td>
											<?php
											$clase = "";
											$ing = $row->monto + $row->propina;
											// $dif = abs($ing -$rec);
											$dif = $ing - $rec;
											// if ($dif > 0) {
											if ($dif < 0) {
												$clase = "color:#bd2130";
											}
											?>
											<td style='<?php echo "padding: 5px; {$clase}" ?>' class="text-right">
												<?php
												echo number_format(abs($dif), 2);
												?>
											</td>
										<?php endif ?>
									</tr>
								<?php endforeach ?>
								<tr>
									<td style="padding: 5px;" class="text-right">
										<b>Total Ingresos Sede:</b>
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php
										$ing = suma_field($value, "monto");
										$totalIngresos += $ing;
										echo number_format($ing, 2);
										?>
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php
										$prop = suma_field($value, "propina");
										$totalPropinas += $prop;
										echo number_format($prop, 2);
										?>
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php
										echo number_format($prop + $ing, 2);
										?>
									</td>
								</tr>
							<?php endforeach ?>
							<tr>
								<td style="padding: 5px;" class="text-right">
									<b>Total Ingresos:</b>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									echo number_format($totalIngresos, 2);
									?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									echo number_format($totalPropinas, 2);
									?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									echo number_format($totalPropinas + $totalIngresos, 2);
									?>
								</td>
							</tr>
							<?php foreach ($descuentos as $value) : ?>
								<tr>
									<td colspan="3" style="padding: 5px; font-weight: bold;">
										<h4><?php echo $value[0]->nsede ?></h4>
									</td>
								</tr>
								<tr>
									<td colspan="3" style="padding: 5px;">
										<b>Descuentos</b>
									</td>
								</tr>
								<?php foreach ($value as $row) : ?>
									<tr>
										<td style="padding: 5px;"><?php echo $row->descripcion ?></td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format($row->monto, 2) ?>
										</td>
										<td style="padding: 5px;" class="text-right">
											<?php echo number_format($row->propina, 2) ?>
										</td>
										<td style="padding: 5px;" class="text-right"><?php echo number_format($row->monto + $row->propina, 2) ?></td>
									</tr>
								<?php endforeach ?>
								<tr>
									<td style="padding: 5px;" class="text-right">
										<b>Total Descuentos Sede:</b>
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php
										$desc = suma_field($value, "monto");
										$totalDescuentos += $desc;
										echo number_format($desc, 2);
										?>
									</td>
									<td style="padding: 5px;" class="text-right">
										<?php
										$prop_desc = suma_field($value, "propina");
										$totalPropDescuentos += $prop_desc;
										echo number_format($prop_desc, 2);
										?>
									</td>
									<td style="padding: 5px;" class="text-right"><?php echo number_format($desc + $prop_desc, 2); ?></td>
								</tr>
							<?php endforeach ?>
							<tr>
								<td style="padding: 5px;" class="text-right">
									<b>Total Descuentos:</b>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									echo number_format($totalDescuentos, 2);
									?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									echo number_format($totalPropDescuentos, 2);
									?>
								</td>
								<td style="padding: 5px;" class="text-right">
									<?php
									echo number_format($totalDescuentos + $totalPropDescuentos, 2);
									?>
								</td>
							</tr>
						<?php endif ?>
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<?php if (isset($detalle)) : ?>
		<div class="row">
			<div class="col-sm-12">
				<table class="table table-bordered">
					<?php foreach ($detalle as $key => $row) : ?>
						<tr>
							<th colspan="6"><?php echo $key ?></th>
						</tr>
						<tr>
							<th class="text-center" colspan="2">Factura</th>
							<th class="text-center">Fecha</th>
							<th class="text-center">Documento</th>
							<th class="text-center">Monto</th>
							<th class="text-center">Propina</th>
						</tr>
						<?php foreach ($row as $det) : ?>
							<tr>
								<td <?php echo (int)$det->estatus_comanda === 3 ? "style='color: red;'" : '' ?>><?php echo $det->serie_factura ?></td>
								<td <?php echo (int)$det->estatus_comanda === 3 ? "style='color: red;'" : '' ?>><?php echo $det->numero_factura ?></td>
								<td <?php echo (int)$det->estatus_comanda === 3 ? "style='color: red;'" : '' ?>><?php echo formatoFecha($det->fecha_factura, 2) ?></td>
								<td <?php echo (int)$det->estatus_comanda === 3 ? "style='color: red;'" : '' ?>><?php echo $det->documento ?></td>
								<td <?php echo (int)$det->estatus_comanda === 3 ? "style='color: red;'" : '' ?> class="text-right"><?php echo number_format($det->monto, 2) ?></td>
								<td <?php echo (int)$det->estatus_comanda === 3 ? "style='color: red;'" : '' ?> class="text-right"><?php echo number_format($det->propina, 2) ?></td>
							</tr>
						<?php endforeach ?>
						<tr>
							<td colspan="6">
								<p><br></p>
							</td>
						</tr>
					<?php endforeach ?>
				</table>
			</div>
		</div>
	<?php endif ?>

	<footer class="text-right">
		<span style="font-weight: bold;">Impresión: <?php echo $fhimpresion ?></span>
	</footer>
</body>

</html>