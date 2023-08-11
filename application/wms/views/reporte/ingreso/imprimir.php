<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ingreso</title>
</head>

<body lang="es-GT" dir="ltr">
    <table class="tabla-contenido">
        <tr>
            <td class="text-center">
                <h2><?php echo $empresa ?></h2>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h3><?php echo $sede . " ({$alias_sede})" ?></h3>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h3>Hoja de Ingreso</h3>
            </td>
        </tr>
        <tr>
            <td class="text-center">
                <h4>Impreso: <?php echo date('d/m/Y H:i:s'); ?></h4>
            </td>
        </tr>
    </table>
    <br />
    <table class="encabezado">
        <tr>
            <th class="text-right" style="width: 16.66%;">Número:</th>
            <td style="width: 16.67%;"><?php echo $excel ? $ingreso : number_format($ingreso); ?></td>
            <th class="text-right" style="width: 16.66%;">Fecha:</th>
            <td style="width: 16.67%;"><?php echo $fecha; ?></td>
            <th class="text-right" style="width: 16.66%;"></th>
            <td style="width: 16.68%;"></td>
        </tr>
        <tr>            
            <th class="text-right" style="width: 16.66%;">Bodega:</th>
            <td colspan="5"><?php echo $bodega; ?></td>
        </tr>
        <tr>
            <th class="text-right">Tipo:</th>
            <td><?php echo $tipo_movimiento; ?></td>
            <th class="text-right">Proveedor:</th>
            <td colspan="3"><?php echo $proveedor; ?></td>
        </tr>
        <?php if ($bodega_origen) : ?>
            <tr>
                <th class="text-right">Origen:</th>
                <td colspan="5"><?php echo $bodega_origen; ?></td>
            </tr>
        <?php endif; ?>

        <?php if ($documento) : ?>
            <tr>
                <th class="text-right">Tipo de docto.:</th>
                <td><?php echo $documento->tipo; ?></td>
                <th class="text-right">No. de docto.:</th>
                <td colspan="3"><?php echo $documento->serie . '-' . $documento->numero; ?></td>
            </tr>
        <?php endif; ?>
        <?php if ($egreso_origen) : ?>
            <tr>
                <th class="text-right">Egreso origen:</th>
                <td colspan="5"><?php echo "#{$egreso_origen}"; ?></td>
            </tr>
        <?php endif; ?>
        <tr>
            <th class="text-right">Comentario:</th>
            <td colspan="5">
                <p><?php echo $comentario; ?></p>
            </td>
        </tr>
    </table>
    <br />
    <table style="font-size: 10pt;">
        <thead>
            <tr>
                <th class="text-left" style="width: 16.66%">Código</th>
                <th class="text-left" style="width: 16.70%">Descripción</th>
                <th class="text-left" style="width: 16.66%">Presentación</th>
                <th class="text-right" style="width: 16.66%">Cantidad</th>
                <th class="text-right" style="width: 16.66%">Costo U.</th>
                <th class="text-right" style="width: 16.66%">Total</th>
            </tr>
        </thead>
        <tbody>
            <?php $montoTotal = 0; ?>
            <?php foreach ($detalle as $det) : ?>
                <tr>
                    <td><?php echo (string)$det->codigo; ?></td>
                    <td><?php echo $det->articulo; ?></td>
                    <td><?php echo $det->presentacion; ?></td>
                    <td class="text-right"><?php echo $excel ? $det->cantidad : number_format((float)$det->cantidad, 2); ?></td>
                    <td class="text-right"><?php echo $excel ? $det->costo_unitario_con_iva : number_format((float)$det->costo_unitario_con_iva, 4); ?></td>
                    <td class="text-right"><?php echo $excel ? $det->costo_total_con_iva : number_format((float)$det->costo_total_con_iva, 2); ?></td>
                </tr>
                <?php $montoTotal += (float)$det->costo_total_con_iva; ?>
            <?php endforeach; ?>
        </tbody>
    </table>
    <br />
    <table>
        <tr>
            <?php if($excel): ?>
                <td class="text-right bld" colspan="6">Total: <?php echo $montoTotal; ?></td>
            <?php else: ?>
                <td class="text-right bld">Total: <?php echo $excel ? $montoTotal : number_format((float)$montoTotal, 2); ?></td>
            <?php endif; ?>
        </tr>
    </table>
    <br /><br /><br /><br /><br />
    <table>
        <tr>
            <td style="width: 35%;"></td>
            <td class="text-center bld" style="border-top: 1px solid black; width: 30%;">Firma de Bodeguero</td>
            <td style="width: 35%;"></td>
        </tr>
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
        border: 0px solid black;
    }

    .encabezado {
        border: 1px solid black;
        border-radius: 1pt;
    }

    td {
        width: auto;
        border-collapse: collapse;
        border: 0px solid black;
    }

    .text-right {
        text-align: right;
    }

    .text-left {
        text-align: left;
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

    .bld {
        font-weight: bold;
    }
</style>