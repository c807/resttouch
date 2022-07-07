<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<title><?php echo ($esfisico ? 'Inventario_Fisico_' : 'Cuadre_Diario_').date('YmdHis') ?></title>
</head>

<body>
	<table class="tabla-contenido">
		<?php $col = $esfisico ? (((int)$inventario->confirmado === 1) ? '4' : '3') : (((int)$inventario->confirmado === 1) ? '4' : '2'); ?>
		<tr>
			<td colspan="<?php echo $col ?>" class="text-center">
				<h1><?php echo ($esfisico ? 'Inventario Físico' : 'Cuadre Diario') . ' # ' . $inventario->inventario_fisico ?></h1>
			</td>
			<td colspan="2" class="text-center">Fecha <?php echo formatoFecha($inventario->fhcreacion, 2) ?></td>
		</tr>

		<tr>
			<td class="titulo">Descripcion</td>
			<td class="titulo">Código</td>
			<td class="titulo">Presentación</td>

			<?php if ($esfisico || (!$esfisico && (int)$inventario->confirmado === 1)) : ?>
				<td class="titulo">Existencia Sistema</td>
			<?php endif ?>

			<td class="titulo">Existencia Física</td>
			<?php if ($inventario->confirmado) : ?>
				<td class="titulo">Diferencia</td>
			<?php endif ?>
		</tr>
		<?php
		$col = $esfisico ? (((int)$inventario->confirmado === 1) ? '6' : '5') : (((int)$inventario->confirmado === 1) ? '6' : '4');
		foreach ($detalle as $key => $cat) :
		?>
			<tr>
				<td class="titulo" style="text-align: left;background-color: #E5E5E5; font-weight: bold;" colspan="<?php echo $col ?>">
					<?php echo $cat['descripcion'] ?>
				</td>
			</tr>
			<?php foreach ($cat['datos'] as $gcat) : ?>
				<tr>
					<td class="titulo" style="text-align: left;background-color: #E5E5E5; font-weight: bold;" colspan="<?php echo $col ?>">
						<?php echo $gcat['descripcion'] ?>
					</td>
				</tr>
				<?php foreach ($gcat['datos'] as $art) :

					$articulo = new Articulo_model($art->articulo);
					$pres     = $articulo->getPresentacionReporte();

					if ($inventario->confirmado && !$esfisico) {
						$diferencia = ($art->existencia_sistema / $pres->cantidad) - $art->existencia_fisica;

						if ($diferencia == 0) {
							continue;
						}
					}
				?>
					<tr>
						<td>
							<?php echo $art->narticulo ?>
						</td>

						<td>
							<?php echo empty($art->codigo) ? $art->articulo : $art->codigo ?>
						</td>

						<td>
							<?php echo $pres->descripcion ?>
						</td>

						<?php if ($esfisico || (!$esfisico && (int)$inventario->confirmado === 1)) : ?>
							<td class="text-center">
								<?php echo number_format($art->existencia_sistema / $pres->cantidad, 2) ?>
							</td>
						<?php endif ?>

						<td class="text-center">
							<?php if ($esfisico) : ?>
								<?php if (isset($existencia_fisica)) : ?>
									<?php echo number_format($art->existencia_fisica, 2) ?>
								<?php endif ?>
							<?php else : ?>
								<?php if (isset($existencia_fisica)) : ?>
									<?php echo (float)$art->existencia_fisica != 0 ? number_format($art->existencia_fisica, 2) : '&nbsp;'; ?>
								<?php endif ?>
							<?php endif ?>
						</td>

						<?php if ($inventario->confirmado) : ?>
							<td class="text-center">
								<?php echo number_format(($art->existencia_sistema / $pres->cantidad) - $art->existencia_fisica, 2); ?>
							</td>
						<?php endif ?>
					</tr>
				<?php endforeach ?>
			<?php endforeach ?>
		<?php endforeach ?>

	</table>
</body>

</html>

<style type="text/css">
	body {
		font-family: sans-serif;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		border: 1px solid black;
	}

	td {
		width: auto;
		border-collapse: collapse;
		border: 1px solid black;
	}

	.text-right {
		text-align: right;
	}

	.text-center {
		text-align: center;
	}

	.tabla-contenido {
		font-size: 0.65em;
	}

	.tabla-firma {
		font-size: 0.90em;
	}

	.tabla-firma-td {
		border: none;
		text-align: center;
		padding: 15px 1px 15 1px;
	}

	.titulo {
		text-align: center;
		vertical-align: middle;
		background-color: #E5E5E5;
		font-weight: bold;
	}

	.totales {
		text-align: right;
		background-color: #E5E5E5;
	}
</style>