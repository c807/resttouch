<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
</head>
<body>
	<?php $totalprop = 0; ?>
	<div class="row">
		<div class="col-sm-12">
			<table style="width: 100%">
				<tr>
					<td><?php echo $empresa->nombre ?></td>
				</tr>
				<tr>
					<td><?php echo $sede->nombre ?></td>
				</tr>
			</table>
		</div>
	</div>
	<table class="tabla-contenido">
		<tr>
			<td colspan="6" class="text-center"><h1>Distribución de propinas</h1></td>
		</tr>
		<tr>
			<td colspan="6" class="text-center">
				<h3>
				Del: <?php echo formatoFecha($fdel,2) ?> al: <?php echo formatoFecha($fal,2) ?>
				</h3>
			
			</td>
		</tr>
		<?php if ($detalle): ?>
			<tr>
				<th colspan="2"></th>
				<th class="text-center">Fecha</th>
				<th class="text-center">Comanda</th>
				<th class="text-center">Facturas</th>
				<th class="text-center">Propina</th>
			</tr>
			
			<?php foreach ($datos as $row): ?>				
				<tr>
					<th class="text-left" colspan="6">
						<?php echo $row['descripcion'] ?>
					</th>
				</tr>
				$row->usuario
				<?php if (isset($row['usuario'])): ?>
					<?php $cntUsuarios = count($row['usuario']); ?>
					<?php foreach ($row['usuario'] as $key => $usu): ?>
						<?php $rows = count($usu['facturas'])+1 ?>
						<tr>
							<td colspan="6">
								<?php echo $usu['nombre'] ?>
							</td>
						</tr>
						<?php foreach ($usu['facturas'] as $fac): ?>
							<tr>
								<td colspan="2"></td>
								<td><?php echo $fac->fecha_factura ?></td>
								<td><?php echo $fac->getComanda()->comanda ?></td>
								<td><?php echo $fac->numero_factura ?></td>
								<td class="text-right">
									<?php 
										echo number_format(($fac->propina * $row['porcentaje'] / 100) / $cntUsuarios, 2) ?>
								</td>
							</tr>
						<?php endforeach ?>
						<tr>
							<th colspan="5" class="text-right">Total Empleado</th>
							<td class="text-right">
								<?php $totalprop+=$usu['propina'] ?>
								<?php echo number_format($usu['propina'],2) ?> 
							</td>
						</tr>
						
					<?php endforeach ?>
				<?php else: ?>
					
					<tr>
						<td colspan="6">N/A</td>
					</tr>

					<?php foreach ($row['facturas'] as $fac): ?>
						<tr>
							<td colspan="2"></td>
							<td><?php echo $fac->fecha_factura ?></td>
							<td><?php echo $fac->getComanda()->comanda ?></td>
							<td><?php echo $fac->numero_factura ?></td>
							<td class="text-right">
								<?php echo number_format($fac->propina * $row['porcentaje']/100,2) ?>
							</td>
						</tr>
					<?php endforeach ?>
					<tr>
						<th colspan="5" class="text-right">Total Empleado</th>
						<td class="text-right">
							<?php $totalprop+=$row['propina'] ?>
							<?php echo number_format($row['propina'],2) ?> 
						</td>
					</tr>
				<?php endif ?>
			<?php endforeach ?>
		<?php else: ?>
			<tr>
				<td colspan="3" class="text-center">Empleado</td>
				<td colspan="3" class="text-center">Propina</td>
			</tr>

			<?php foreach ($datos as $row): ?>
				<?php $totalTipo = 0; ?>
				<tr>
					<th class="text-left" colspan="6">
						<?php echo $row['descripcion'] ?>
					</th>
				</tr>
				<?php if (isset($row['usuario'])): ?>
					<?php foreach ($row['usuario'] as $key => $usu): ?>
						<?php $totalTipo+= $usu['propina'] ?>
						<tr>
							<td colspan="3"><?php echo $usu['nombre'] ?></td>
							<td colspan="3" class="text-right">
								<?php $totalprop+=$usu['propina'] ?>
								<?php echo number_format($usu['propina'],2) ?> 
							</td>
						</tr>
						
					<?php endforeach ?>
				<?php else: ?>
					<?php $totalTipo+= $row['propina'] ?>
					<tr>
						<td colspan="3" >N/A</td>
						<td colspan="3" class="text-right">
							<?php $totalprop+=$row['propina'] ?>
							<?php echo number_format($row['propina'],2) ?> 
						</td>
					</tr>
				<?php endif ?>
				<tr>
					<th colspan="5" class="text-right">Total por tipo</th>
					<td class="text-right">
						<?php echo number_format($totalTipo,2) ?> 
					</td>
				</tr>
			<?php endforeach ?>
		<?php endif ?>
		<tr>
			<td colspan="6"></td>
		</tr>
		<tr>
			<th rowspan="2" colspan="5" class="text-right">Total General</th>
			<td class="text-right"><?php echo number_format($totalprop, 2) ?></td>
		</tr>
	</table>
</body>
</html>
<style type="text/css">
	body {font-family: sans-serif;}
	table {width: 100%; }
	td {width: auto; }

	.text-right {text-align: right;}
	.text-left {text-align: left;}
	.text-center {text-align: center;}
	.tabla-contenido {font-size: 0.65em;}
	.tabla-firma {font-size: 0.90em;}
	.tabla-firma-td {border: none; text-align:center;padding: 15px 1px 15 1px;}
	.titulo {text-align: center; vertical-align: middle; background-color: #E5E5E5; font-weight: bold;}
	.totales {text-align: right; background-color: #E5E5E5; }
</style>