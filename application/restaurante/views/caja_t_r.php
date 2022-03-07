<!DOCTYPE html>
<div lang="en">

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

    <!--For de turnos -->
    <?php foreach ($json_data_turnos as $row) : ?>
        <!-- Encabezado nombre del turno -->
        <div class="row">
            <div class="col-sm-12">
                <table style="width: 100%;">
                    <tr>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;"><h4><?php echo $row->name ?></h4></td>
                    </tr>
                    <tr>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <td>&nbsp;</td>
                    </tr>
                </table>
            </div>
        </div>
        <!-- Table de domicilios o formas de entregar -->
        <?php foreach ($row->data as $rowD) : ?>
            <table class="table table-bordered" style="padding: 5px">
                <thead>
                <tr>
                    <th style="padding: 5px; font-weight: normal; width: 25%;" class="text-center">Descripcion</th>
                    <th style="padding: 5px; font-weight: normal; " class="text-center">Monto</th>
                    <th style="padding: 5px; font-weight: normal; " class="text-center">Propina</th>
                    <th style="padding: 5px; font-weight: normal; " class="text-center">Total</th>
                </tr>
                </thead>
                <tbody>


                <!-- Nombre del metodo de pago -->
                <tr>
                    <td style="text-align: left; font-weight: bold; padding-left: 5px;">
                        <strong><?php echo $rowD->name ?></strong></td>
                </tr>

                <!-- Itereando por los metodos de pago -->
                <?php foreach ($rowD->ingresos as $rowDI) : ?>
                    <tr>
                        <td style="text-align: left;  padding-left: 5px;"><?php echo $rowDI->metodo_pago ?></td>
                        <td style="text-align: right; padding-right: 5px;"><?php echo $rowDI->monto ?></td>
                        <td style="text-align: right; padding-right: 5px;"><?php echo $rowDI->propina ?></td>
                        <td style="text-align: right; padding-right: 5px;"><?php echo $rowDI->total ?></td>
                    </tr>
                <?php endforeach ?>

                <!-- Consumo Total -->
                <tr>
                    <td style="text-align: left;  padding-left: 5px;"></td>
                    <td style="text-align: right; padding-right: 5px;"></td>
                    <td style="text-align: right; padding-right: 5px; font-weight: bold;"><strong>Total :</strong></td>
                    <td style="text-align: right; padding-right: 5px;"><?php echo $rowD->consumo_total ?></td>
                </tr>

                </tbody>
            </table>
        <?php endforeach ?>
        <!-- Footer del turno -->
        <div class="row"><h5>TOTAL DE COMENSALES :<?php echo $row->totalComensales ?></h5></div>
        <div class="row"><h5>CONSUMO PROMEDIO TOTAL :<?php echo $row->consumo_promedio_total ?></h5></div>

    <?php endforeach ?>


    </html>
