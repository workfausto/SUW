const { Router } = require('express');
const router = new Router();
var QRCode = require('qrcode');
const db = require('../config/dbcon.js').callback;
const mailsend = require("../config/mailSender.js").sender;

// coneccion a mysql
// var pool = mysql.createPool({
//     connectionLimit: 5,
//     host: "localhost",
//     user: "root",
//     password: "Contraseña12",
//     database: "evento"
// });

router.get('/', (req, res) => {

    var correo = req.query.correo;
    /*
    //4testing
    var password = 'unapasword';
    var nombre = 'placeholder';
    //res.json(JSON.parse('{"res":"got ' + ok.toString() + ' out of ' + total.toString() + '"}'));
    if (correo) { //here
        QRCode.toDataURL(correo) //here
            .then(url => {
                mailsend(correo, password, nombre, url.toString(), function(err) {
                    if (err) {
                        res.json(JSON.parse('{"err":"error envio"}'));
                    } else {
                        res.json(JSON.parse('{"res":"Uiesssssss"}'));
                    }
                });
            })
            .catch(err => {
                res.json(JSON.parse('{"err":"error qr"}'));
                //No se pudo convertir la imagen en QR
            });
    } else {
        res.json(JSON.parse('{"err":"error correo"}'));
        //No hay correo, que hacer?
    }
    */

    var JSONRespuesta;
    db("SELECT nombre,correo,password FROM registro_eventos.registros WHERE enviado = 0", function(err, result, fields) {
        if (err) throw err;
        JSONRespuesta = result;

    });
    var total = 0;
    var ok = 0;
    for (var current in JSONRespuesta) {
        total = total + 1;
        if (current.correo) { //here
            QRCode.toDataURL(current.correo) //here
                .then(url => {
                    mailsend(current.correo, current.password, current.nombre, url.toString(), function(err) {

                        if (err) {
                            console.log('error on send');
                            //here
                            //El correo no se pudo enviar, revisar? reintentar?
                        } else {
                            ok = ok + 1;
                            var queryprepare = "UPDATE `registro_eventos`.`registros` SET enviado = 1 WHERE correo = ?";
                            db(queryprepare, [current.correo], function(err, result, fields) {
                                if (err) throw err;
                            });
                        }
                    });
                })
                .catch(err => {
                    //No se pudo convertir la imagen en QR
                });
        } else {
            //No hay correo, que hacer?
        }
    }
    res.json(JSON.parse('{"res":"got ' + ok.toString() + ' out of ' + total.toString() + '"}'));

});

router.post('/', (req, res) => {
    var idEvento = req.body.idEvento;
    var idAsistente = req.body.idAsistente;
    if (idEvento && idAsistente) {
        //doInsertAsistencia
        //Yisus
        res.json(JSON.parse('{"res":"Se ha realizado la accion exitosamente"}'));
    } else {
        res.json(JSON.parse('{"err":"Uno o mas parametros no fueron suministrados"}'));
    }
});

module.exports = router;