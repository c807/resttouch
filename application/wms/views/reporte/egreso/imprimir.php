<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Salida</title>
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
                <h3>Hoja de Salida</h3>
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
            <td style="width: 16.67%;"><?php echo number_format($egreso); ?></td>
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
            <th class="text-right">Traslado:</th>
            <td><?php echo $traslado; ?></td>
            <th class="text-right">Ajuste:</th>
            <td><?php echo $ajuste; ?></td>
        </tr>
        <tr>
            <th class="text-right">Estatus:</th>
            <td><?php echo $estatus_movimiento; ?></td>            
        </tr>
        <tr>
            <th class="text-right">Destino:</th>
            <td colspan="5"><?php echo $bodega_destino; ?></td>
        </tr>
        <tr>
            <th class="text-right">Comentario:</th>
            <td colspan="5">
                <p><?php echo $comentario; ?></p>
            </td>
        </tr>        
    </table>
    <br />
    <table style="font-size: 9pt;">
        <thead>
            <tr>
                <th class="text-left" style="width: 15%">Código</th>
                <th class="text-left" style="width: 25.02%">Descripción</th>
                <th class="text-left" style="width: 24.98%">Presentación</th>
                <th class="text-right" style="width: 11.66%">Cantidad</th>
                <th class="text-right" style="width: 11.67%">Costo U.</th>
                <th class="text-right" style="width: 11.67%">Total</th>
            </tr>
        </thead>
        <tbody>
            <?php $montoTotal = 0; ?>
            <?php foreach ($detalle as $det) : ?>
                <tr>
                    <td><?php echo $det->codigo; ?></td>
                    <td><?php echo $det->articulo; ?></td>
                    <td><?php echo $det->presentacion; ?></td>
                    <td class="text-right"><?php echo number_format((float)$det->cantidad, 2); ?></td>
                    <td class="text-right"><?php echo number_format((float)$det->costo_unitario, 2); ?></td>
                    <td class="text-right"><?php echo number_format((float)$det->costo_total, 2); ?></td>
                </tr>
                <?php $montoTotal += (float)$det->costo_total; ?>
            <?php endforeach; ?>
        </tbody>
    </table>
    <br />
    <table>
        <tr>
            <td class="text-right bld">Total: <?php echo number_format((float)$montoTotal, 2); ?></td>
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