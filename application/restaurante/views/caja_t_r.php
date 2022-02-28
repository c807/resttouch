<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
</head>

<!-- Encabezado -->
<div class="row">
    <div class="col-sm-12">
        <table style="width: 100%;">
            <tr>
                <td style="font-weight: bold; text-align:center;"><?php echo $empresa->nombre ?></td>
            </tr>
            <tr>
                <td style="font-weight: bold; text-align:center;"><?php echo $nsede ?></td>
            </tr>
            <tr>
                <td style="font-weight: bold; text-align:center;">
                    <h5>
                        <b>Del:</b>
                        <?php echo formatoFecha($fdel, 2) ?>
                        <b>al:</b>
                        <?php echo formatoFecha($fal, 2) ?>
                    </h5>
                </td>
            </tr>
        </table>
    </div>
</div>

<?php foreach ($json_data_turno as $row) : ?>
    <!-- Encabezado -->
    <div class="row">
        <div class="col-sm-12">
            <table style="width: 100%;">
                <tr>
                    <td>&nbsp;</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; text-align:center;"><?php echo $row->name ?></td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                </tr>
            </table>
        </div>
    </div>

    <table class="table table-bordered" style="padding: 5px">
        <thead>
        <tr>
            <th style="padding: 5px;" class="text-center">Descripcion</th>
            <th style="padding: 5px;" class="text-center">Monto</th>
            <th style="padding: 5px;" class="text-center">Propina</th>
            <th style="padding: 5px;" class="text-center">Total</th>
        </tr>
        </thead>
        <tbody>
        <?php foreach ($row->data as $rowD) : ?>
            <tr>
                <td><?php echo $rowD ?></td>
                <td>Test</td>
                <td>Test</td>
            </tr>
        <?php endforeach ?>
        </tbody>
    </table>
<?php endforeach ?>


</html>
