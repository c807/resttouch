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

        <?php
        if(!($row->totalComensales > 0) &&
            !($row->consumo_promedio_total > 0) &&
            !($row->cantidadDeMesasUtilizadas > 0)){
            continue;
        }
        ?>
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
        <?php
        $last_index = count($row->data);
        $counter = 0;
        foreach ($row->data as $rowD) : ?>

            <table class="table table-bordered" style="padding: 5px">
                <thead>
                <tr>
                    <th style="padding: 5px; font-weight: normal; width: 25%;" class="text-center">Descripcion</th>
                    <th style="padding: 5px; font-weight: normal; " class="text-center">Monto</th>
                    <th style="padding: 5px; font-weight: normal; " class="text-center">Propina</th>
                    <th style="padding: 5px; font-weight: normal; " class="text-center">Total</th>
                    <th style="padding: 5px; font-weight: normal; " class="text-center">Total (sin I.V.A.)</th>
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
                        <td style="text-align: right; padding-right: 5px;"><?php echo number_format($rowDI->monto, 2, '.', ',') ?></td>
                        <td style="text-align: right; padding-right: 5px;"><?php echo number_format($rowDI->propina, 2, '.', ',') ?></td>
                        <td style="text-align: right; padding-right: 5px;"><?php echo number_format($rowDI->total, 2, '.', ',') ?></td>
                        <td style="text-align: right; padding-right: 5px;"><?php echo number_format($rowDI->total_base, 2, '.', ',') ?></td>
                    </tr>
                <?php endforeach ?>

                <!-- Consumo Total -->
                <tr>
                    <td style="text-align: left;  padding-left: 5px;"></td>
                    <td style="text-align: right; padding-right: 5px;"></td>
                    <td style="text-align: right; padding-right: 5px; font-weight: bold;"><strong>Total :</strong></td>
                    <td style="text-align: right; font-weight: bold; padding-right: 5px;"><strong><?php echo number_format($rowD->consumo_total, 2, '.', ',') ?></strong></td>
                    <td style="text-align: right; font-weight: bold; padding-right: 5px;"><strong><?php echo number_format($rowD->consumo_total_base, 2, '.', ',') ?></strong></td>
                </tr>

                <!-- GRAN TOTAL -->
                <?php
                $counter++;
                if ($last_index === $counter): ?>
                    <tr>
                        <td style="text-align: left;  padding-left: 5px;"></td>
                        <td style="text-align: right; padding-right: 5px;"></td>
                        <td style="text-align: left; font-weight: bold; padding-left: 5px;"><strong>Gran Total</strong></td>
                        <td style="text-align: right; font-weight: bold; padding-left: 5px;"><strong><?php echo number_format($row->granTotal, 2, '.', ','); ?></strong></td>
                        <td style="text-align: right; font-weight: bold; padding-left: 5px;">
                            <strong><?php echo number_format($row->granTotal_base, 2, '.', ','); ?></strong>
                        </td>
                    </tr>
                <?php endif; ?>


                </tbody>
            </table>
        <?php endforeach ?>


        <!-- Footer del turno -->

        <div class="row"><h5>TOTAL DE COMENSALES:&nbsp;<?php echo $row->totalComensales ?></h5></div>
        <div class="row"><h5>CONSUMO PROMEDIO TOTAL:&nbsp;<?php echo number_format($row->consumo_promedio_total, 2, '.', ',') ?></h5></div>
        <div class="row"><h5>CANTIDAD DE MESAS UTILIZADAS:&nbsp;<?php echo$row->cantidadDeMesasUtilizadas ?></h5></div>

    <?php endforeach ?>

    <br/>
    <div class="text-center">
		<span style="font-weight: bold;">No incluye facturas manuales porque a las facturas manuales no se les asigna turno.</span>
	</div>


    </html>
