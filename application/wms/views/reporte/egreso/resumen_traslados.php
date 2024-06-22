<!DOCTYPE html>
<html lang="es-GT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <title>Resumen de Traslados</title>
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
            <h3>Resumen de Traslados</h3>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 text-center">
            <span><b>Del:</b> <?= date('d/m/Y', strtotime($params['fdel'])); ?> <b>al:</b> <?= date('d/m/Y', strtotime($params['fal'])); ?></span>
        </div>
    </div>
    <br />
    <div class="table-responsive">
        <table class="table table-bordered" style="padding: 5px">
            <thead>
                <tr>
                    <th style="padding: 5px;" class="text-center"><?= $bodegaOrigen ?></th>
                    <?php foreach ($bodegasDestino as $bodegaDestino): ?>
                        <th style="padding: 5px;" class="text-center"><?= $bodegaDestino ?></th>
                    <?php endforeach; ?>
                    <th style="padding: 5px;" class="text-center">Suma</th>
                    <th style="padding: 5px;" class="text-center">Precio Costo</th>
                    <th style="padding: 5px;" class="text-center">Total</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($data as $articulo => $info): ?>
                <tr>
                    <td style="padding: 5px;" class="text-left"><?= $info['articulo_descripcion'] ?></td>
                    <?php foreach ($bodegasDestino as $key => $bodegaDestino): ?>
                        <td style="padding: 5px;" class="text-right"><?= isset($info['bodegas'][$key]) ? $info['bodegas'][$key] : 0 ?></td>
                    <?php endforeach; ?>
                    <td style="padding: 5px;" class="text-right"><?= $info['cantidad_total'] ?></td>
                    <td style="padding: 5px;" class="text-right">Q.<?= number_format($info['precio_unitario'], 2) ?></td>
                    <td style="padding: 5px;" class="text-right">Q.<?= number_format($info['cantidad_total'] * $info['precio_unitario'], 2) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot>
                <tr>
                    <th style="padding: 5px;" colspan="<?= 3 + count($bodegasDestino) ?>" class="text-right bold">TOTAL:</th>
                    <th style="padding: 5px;" class="text-right">Q<?= number_format($totalFinal, 2) ?></th>
                </tr>
            </tfoot>
        </table>
    </div>
</body>
</html>
