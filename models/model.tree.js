var $fs       = require('fs');
var $path     = require('path');
var $db       = require('../library/model.api');
var $log      = require('../library/log.api');
var $unique   = require('uniqid');
var $express  = require('express');
var $router   = $express.Router();
var $htmlPdf  = require('html-pdf');
var $HtmlDocx  = require('html-docx-js');
var $Mysql     = require('mysql');
var $sshconn   = require('ssh2-connect');
var $sshexec   = require('ssh2-exec');
var $sshclient = require('scp2');

// $router.all('/':ok
$router.all('/',($rq,$rs)=>{
    $rs.sendStatus(404);
});

// Tree content.
// $router.get('/init':ok
$router.get('/init',(rq,$rs) => {
    if(rq.session.status===true){

        let log = rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log += ' GET /models/model/tree/init';

        let order = new Object();
            order['text'] = ['DESC','string'];

        let callback = (result,rows) => {

                if(result===true){

                    if(rows.length>=1){
                        let tmp = new Array();
                        for(i in rows){
                            rows[i].item.sort((a,b)=>{

                                let A = a.text;
                                    A = A.match(/[0-9]/gi);
                                    A = A.join('');
                                    A = parseInt(A);

                                let B = b.text;
                                    B = B.match(/[0-9]/gi);
                                    B = B.join('');
                                    B = parseInt(B);

                                    if(A<B) return -1;
                                    if(A>B) return 1;
                                    return 0;
                            });
                            tmp.push(rows[i]);
                        }
                        rows = tmp;
                    }

                    $log
                        .to('auth')
                        .write(log,'success');
                    $rs.json({"id":0,"text":"Boletines","item":rows});
                }
                else {
                    $log
                        .to('auth')
                        .write(log,'errors');
                    $rs.sendStatus(404);
                }
            };

            $db
                .select('SET')
                .from('boletin')
                .where(null)
                .orderBy(order)
                .done(callback);

    } else $rs.sendStatus(404);
});

// Periodos.
// $router.post('/periodo':ok
$router.post('/periodo',(rq,$rs) => {
    if(rq.session.status===true){

        let log = rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log += ' POST /models/model/tree/periodo';

        let values = new Object();
            values['id'] = $unique();
            values['parent'] = 0;
            values['text']   = rq.body.periodo;
            values['text']   = values['text'].match(/([0-9\°\º\º]{2,4})( periodo legislativo )(\()([0-9]{4})(\))/gi);
            values['text']   = values['text'].join('');
            values['im0']    = 'folderClosed.gif';
            values['im1']    = 'folderOpen.gif';
            values['im2']    = 'folderClosed.gif';
            values['item'] = new Array();

        let callback = (result,rows)=>{
                if(result===true){
                    $log
                        .to('tree')
                        .write(log,'success');

                    
                    $rs
                        .json({result:true,rows:null})
                        .end();
                }

                else {
                    $log
                        .to('tree')
                        .write(log,'errors');
                    $rs.sendStatus(404);
                }
            };

            $db
                .insert()
                .into('boletin')
                .values(values)
                .done(callback);

    } else $rs.sendStatus(404);

});
// $router.get('/periodo/:id':ok
$router.get('/periodo/:id',(rq,$rs) => {
    if(rq.session.status===true){

        let where = new Object();
            where.id = rq.params.id;
            where.id = where.id.match(/[a-z0-9]/gi);
            where.id = where.id.join('');

        let log = rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log = log + ' GET /models/model/tree/periodo/' + where.id;

            $db
                .select('ONE')
                .from('boletin')
                .where(where)
                .done((result,rows)=>{
                    if(result===true){
                        $log
                            .to('tree')
                            .write(log,'success');
                        $rs
                            .json({result:true,rows:rows[0]})
                            .end();
                    }
                    else{
                        $log
                            .to('tree')
                            .write(log,'errors');
                        $rs.sendStatus(404);
                    }
                });
                
    } else $rs.sendStatus(404);
});
// $router.put('/periodo/:id':ok
$router.put('/periodo/:id',(rq,$rs) => {
    if(rq.session.status===true){

        let where = new Object();
            where.id = rq.params.id;
            where.id = where.id.match(/[a-z0-9]/gi)
            where.id = where.id.join('');

        let set = new Object();
            set.text = rq.body.text;
            set.text = set.text.match(/([0-9\°\º\º]{2,4})( periodo legislativo )(\()([0-9]{4})(\))/gi);
            set.text = set.text.join('');

        let log = rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log = log + ' PUT /models/model/tree/periodo/' + where.id;

            $db
                .update('boletin')
                .set(set)
                .where(where)
                .done((result,rows)=>{
                    if(result===true){
                        $log
                            .to('tree')
                            .write(log,'success');
                        $rs.json({result:true,rows:rows});
                    }
                    else{
                        $log
                            .to('tree')
                            .write(log,'errors');
                        $rs
                            .sendStatus(404)
                            .end();
                    }
                });

    } else $rs.sendStatus(404).end();
});
// $router.delete('/periodo/:id':ok
$router.delete('/periodo/:id',(rq,$rs) => {
    if(rq.session.status===true){

        let where = new Object();
            where.id = rq.params.id;
            where.id = where.id.match(/[a-z0-9]/gi);
            where.id = where.id.join('');

        let log = rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log = ' DELETE /models/model/tree/periodo/' + where.id;

            $db
                .delete()
                .from('boletin')
                .where(where)
                .done((result,rows)=>{
                    if(result===true) {
                        $log
                            .to('tree')
                            .write(log,'success');
                        $rs
                            .type('json')
                            .set({'Content-Type':'application/json'})
                            .send({result:true,rows:rows})
                            .end();
                    }
                    else {
                        $log
                            .to('tree')
                            .write(log,'errors');
                        $rs
                            .sendStatus(404)
                            .end();
                    }
                });
    } else $rs.sendStatus(404).end();
});

// Boletines.
// $router.post('/boletin/:periodoid':ok
$router.post('/boletin/:periodoid',($rq,$rs)=>{
    if($rq.session.status===true) {

        let where = new Object();
            where.id = $rq.params.periodoid;
            where.id = where.id.match(/[a-z0-9]/gi);
            where.id = where.id.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' POST /models/model/tree/boletin/' + where.id;

        let json         = new Object();
            json.id      = $unique();
            json.parent  = where.id;
            json.periodo = $rq.body.periodo.match(/([0-9\°\º\º]{2,4})( periodo legislativo )(\()([0-9]{4})(\))/gi).join('');
            json.periodo = json.periodo.match(/^([0-9\°\º\º\ ]{3,6})PERIODO\ LEGISLATIVO/gi);
            json.periodo = json.periodo.join('');
            json.sesion  = $rq.body.sesion.match(/[0-9\º]/gi).join('');
            json.reunion = $rq.body.reunion.match(/[0-9]/g).join('');
            json.forma   = $rq.body.forma.match(/[A-Z\ ]/gi).join('');
            json.fecha   = $rq.body.fecha.match(/[0-9\-]/gi).join('');
            json.hora    = $rq.body.hora.match(/[0-9\:]/gi).join('');
            json.numero  = $rq.body.numero.match(/[0-9]{1,3}/gi).join('');
            json.anio    = $rq.body.anio.match(/[0-9]{4}/gi).join('');
            json.desde   = $rq.body.desde.match(/[0-9-]/g).join('');
            json.hasta   = $rq.body.hasta.match(/[0-9-]/g).join('');
            json.observ  = $rq.body.observ.match(/[A-Z0-9áéíóúÁÉÍÓÚ\,\.\ ]/gi).join('');
            json.text    = json.numero + '/' + json.anio;
            json.tareas  = new Array();

            $db
                .select('ONE')
                .from('boletin')
                .where(where)
                .done((result,$rows)=>{

                    if(result===true){

                        $rows[0].item.push(json);

                        $db
                            .update('boletin')
                            .set({item:$rows[0].item})
                            .done(new Function());

                        let fecha = json.fecha.split('-');
                            fecha = fecha[2] + '/' + fecha[1] + '/' + fecha[0];
    
                        let desde = json.desde.split('-');
                            desde = desde[2] + '/' + desde[1] + '/' + desde[0];
    
                        let hasta = json.hasta.split('-');
                            hasta = hasta[2] + '/' + hasta[1] + '/' + hasta[0];
    
                        let periodoLegislativo     = json.periodo.toLowerCase();
                            periodoLegislativo     = periodoLegislativo.replace('periodo','Periodo').replace('legislativo','Legislativo');
                        
                        let authpath = $path.join(__dirname,'/../database/autoridades.db');
                        let autoridades = $fs.readFileSync(authpath,{encoding:'utf8'});
                            autoridades = JSON.parse(autoridades);
                            autoridades = autoridades[0];

                        let $templatePath = $path.join(__dirname,'/../views/view.mdi.html.template.html');

                        $fs.readFile($templatePath,{encoding:'utf8'},(error,data)=>{

                            if(error===null){
                    
                                let html = data.toString();
                                    html = html
                                        .replace(/{{presidente}}/gi,autoridades.presidente)
                                        .replace(/{{vicepresidente1}}/gi,autoridades.vicepresidente1)
                                        .replace(/{{vicepresidente2}}/gi,autoridades.vicepresidente2)
                                        .replace(/{{parlamentario}}/gi,autoridades.parlamentario)
                                        .replace(/{{administrativo}}/gi,autoridades.administrativo)
                                        .replace(/{{titleBoletin}}/gi,json.numero+'/'+json.anio)
                                        .replace(/{{vignetaAnio}}/gi,json.anio)
                                        .replace(/{{periodoLegislativo}}/gi,periodoLegislativo)
                                        .replace(/{{periodoLegislativo}}/gi,periodoLegislativo)
                                        .replace(/{{encabezadoBoletin}}/gi,json.numero + '/' + json.anio)
                                        .replace(/{{encabezadoBoletin}}/gi,json.numero + '/' + json.anio)
                                        .replace(/{{encabezadoDesde}}/gi,desde)
                                        .replace(/{{encabezadoDesde}}/gi,desde)
                                        .replace(/{{encabezadoHasta}}/gi,hasta)
                                        .replace(/{{encabezadoHasta}}/gi,hasta)
                                        .replace(/{{actividadPeriodo}}/gi,json.periodo)
                                        .replace(/{{actividadAnio}}/gi,json.anio)
                                        .replace(/{{actividadSession}}/gi,json.sesion + ' SESION ' + json.forma)
                                        .replace(/{{actividadReunion}}/gi,json.reunion)
                                        .replace(/{{actividadFecha}}/gi,fecha)
                                        .replace(/{{actividadHora}}/gi,json.hora)
                                        .replace(/{{actividadObservaciones}}/gi,json.observ);
                    
                                    let $boletinFile = json.numero + '-' + json.anio  + '.html';
                                        $boletinFile = $path.join(__dirname,'/model.tree.js.files/html/',$boletinFile);
                                        
                                        $fs.writeFile($boletinFile,html,{encoding:'utf8'},(error)=>{

                                            if(error===null){
                                                $log
                                                    .to('tree')
                                                    .write(log,'success');
                                                $rs.json({result:true,rows:json.id});
                                            }
                    
                                            else {
                                                $log
                                                    .to('tree')
                                                    .write(log,'errors');
                                                $rs.sendStatus(404);
                                            }
                    
                                        });
                    
                            } else $rs.sendStatus(200);
                    
                        });
                        
                    }

                });

    } else $rs.sendStatus(404);
});
//router.get('/boletin/:file/html':ok
$router.get('/boletin/:file/html',(rq,$rs) => {
    if(rq.session.status===true){
        let file = rq.params.file.match(/[a-z0-9\-]/gi);
            file = file.join('');

        let log = rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log = log  + ' GET /models/model/tree/boletin/' + file + '/html';

            file = file + '.html';
            file = $path.join(__dirname,'/model.tree.js.files/html/',file);

            $fs.readFile(file,{encoding:'utf8'},(error,html)=>{
                if(error===null){

                    $log
                        .to('tree')
                        .write(log,'success');

                    $rs
                        .type('text')
                        .set({'Content-Type':'text/html'})
                        .send(html)
                        .end();

                }
                
                else {
                    $log
                        .to('tree')
                        .write(log,'errors');
                    $rs.sendStatus(404);
                }
            });
    } else $rs.sendStatus(404);
});
//router.put('/boletin/:file/html':ok
$router.put('/boletin/:file/html',($rq,$rs)=>{
    if($rq.session.status===true){

        let file = $rq.params.file;
            file = file.match(/[0-9\-]/gi);
            file = file.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' PUT /boletin/' + file + '/html';
        
            file = file + '.html';

        let path = $path.join(__dirname,'/model.tree.js.files/html/',file);

        let html = Buffer
                    .from($rq.rawBody,'base64')
                    .toString('latin1');

            $fs.writeFile(path,html,'utf8',(error)=>{
                if(error===null) {
                    $log
                        .to('tree')
                        .write(log,'success');
                    $rs.json({result:true,rows:null});
                }
                else {
                    $log
                        .to('errors')
                        .write(log,'errors')
                    $rs.sendStatus(404);
                }
            });

        } else $rs.sendStatus(404);
});
//$router.put('/boletin/:file/bloquear':ok
$router.put('/boletin/:file/bloquear',($rq,$rs)=>{
    if($rq.session.status===true){

        let file = $rq.params.file;
            file = file.match(/[0-9\-]/gi);
            file = file.join('');

        let log = $rq.session.user.nomvre + ' ' + $rq.session.user.apellido;
            log = log + ' PUT /models/model/tree/boletin/' + file + '/html';

            file = file + '.html';

        let path = $path.join(__dirname,'/model.tree.js.files/html/',file);

        $fs.readFile(path,{encoding:'utf8'},(e,data)=>{
            if(e===null){
                data = data.replace(/contenteditable="true"/gi,'contenteditable="false"');
                $fs.writeFile(path,data,(e)=>{
                    if(e===null) {
                        $log
                            .to('tree')
                            .write(log,'success');
                        $rs.json({result:true,rows:null});
                    }
                    else {
                        $log
                            .to('tree')
                            .success(log,'errors');
                        $rs.json({result:false,rows:null});
                    }
                });
            } else $rs.sendStatus(404);
        });
    } else $rs.sendStatus(404);
});
//router.put('/boletin/:file/desbloquear':ok
$router.put('/boletin/:file/desbloquear',($rq,$rs)=>{

    if($rq.session.status===true){

        let file = $rq.params.file;
            file = file.match(/[0-9\-]/gi);
            file = file.join('');
            
        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' PUT /models/model/tree/boletin/' + file + '/desbloquear';

            file = file + '.html';

        let path = $path.join(__dirname,'/model.tree.js.files/html/',file);

        $fs.readFile(path,{encoding:'utf8'},(e,data)=>{

            if(e===null){

                data = data.replace(/contenteditable="false"/gi,'contenteditable="true"');
                $fs.writeFile(path,data,{encoding:'utf8'},(e)=>{
                    
                    if(e===null){

                        $log
                            .to('tree')
                            .write(log,'success');
                        $rs.json({result:true,rows:null});

                    }

                    else {

                        $log
                            .to('tree')
                            .write(log,'errors');
                        $rs.json({result:false,rows:null});

                    }

                });

            } else $rs.sendStatus(404);

        });

    } else $rs.sendStatus(404);

});
//$router.delete('/boletin/:periodoid/:boletinid/:boletinfile':ok
$router.delete('/boletin/:periodoid/:boletinid/:boletinfile', (rq,$rs) => {
    if(rq.session.status===true){

        let periodoid = rq.params.periodoid;
            periodoid = periodoid.match(/[0-9a-z]/gi);
            periodoid = periodoid.join('');

        let boletinid = rq.params.boletinid;
            boletinid = boletinid.match(/[a-z0-9]/gi);
            boletinid = boletinid.join('');

        let boletinfile = rq.params.boletinfile;
            boletinfile = boletinfile.match(/[0-9\-]/gi);
            boletinfile = boletinfile.join('');

        let html = boletinfile + '.html';
            html = $path.join(__dirname,'/model.tree.js.files/html/',html);
            if($fs.existsSync(html)===true) $fs.unlinkSync(html);

        let pdf  = boletinfile + '.pdf';
            pdf = $path.join(__dirname,'/model.tree.js.files/pdf/',pdf);
            if($fs.existsSync(pdf)===true) $fs.unlinkSync(pdf);

        let word = boletinfile + '.docx';
            word = $path.join(__dirname,'/model.tree.js.files/word/',word);
            if($fs.existsSync(word)===true) $fs.unlinkSync(word);

        let log = rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log = log + ' DELETE /models/model/tree/boletin/' + periodoid + '/' + boletinid + '/' + boletinfile;
            
        let where = new Object();
            where.id = periodoid;
            
            $db
                .select('ONE')
                .from('boletin')
                .where(where)
                .done((result,rows)=>{

                    if(result===true){

                        let tmp = new Array();

                            for(i in rows[0].item) if(rows[0].item[i].id!=boletinid) tmp.push(rows[0].item[i]);

                            $db
                                .update('boletin')
                                .set({item:tmp})
                                .done(new Function());
                            $log
                                .to('tree')
                                .write(log,'success');
                            $rs
                                .json({result:true,rows:null});

                    }

                });

    } else  $rs.sendStatus(404);
});


// Tareas.
//$router.post('/tarea/:periodoid/:boletinid':ok
$router.post('/tarea/:periodoid/:boletinid',($rq,$rs) => {
    if($rq.session.status===true){

        let periodoid = $rq.params.periodoid;
            periodoid = periodoid.match(/[a-z0-9]/gi);
            periodoid = periodoid.join('');

        let boletinid = $rq.params.boletinid;
            boletinid = boletinid.match(/[a-z0-9]/gi);
            boletinid = boletinid.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' POST /tarea/' + periodoid + '/' + boletinid;

        let tarea = new Object();
            tarea.titulo = $rq.body.titulo;
            tarea.titulo = tarea.titulo.match(/[0-9a-zàèìòùÀÈÌÒÙñÑ\.\,\;\ ]/gi);
            tarea.titulo = tarea.titulo.join('');
            tarea.tarea = $rq.body.tarea;
            tarea.tarea = tarea.tarea.match(/[0-9a-záéíóúÁÉÍÓÚñÑ\<\>\=\"\'\.\,\;\ ]/gi);
            tarea.tarea = tarea.tarea.join('');

        let where = new Object();
            where.id = periodoid;

        $db
            .select('ONE')
            .from('boletin')
            .where(where)
            .done((result,rows)=>{

                if(result===true){

                    let item = rows[0].item;

                        for(x in item){
                            if(item[x].id===boletinid) item[x].tareas.push(tarea);
                        }

                        $db
                            .update('boletin')
                            .set({item:item})
                            .done((result,rows)=>{

                                if(result===true){

                                    $log
                                        .to('tree')
                                        .write(log,'success');

                                    $rs.json({result:true,rows:null});

                                }
                                
                                else {

                                    $log
                                        .to('tree')
                                        .write(log,'errors');

                                    $rs.sendStatus(404);

                                }

                            });
                }

            });

    } else $rs.sendStatus(404);
});
//$router.get('/tareas/:periodoid/:boletinid:ok
$router.get('/tareas/:periodoid/:boletinid',  ($rq,$rs) => {
    if($rq.session.status===true){

        let periodoid = $rq.params.periodoid;
            periodoid = periodoid.match(/[a-z0-9]/gi);
            periodoid = periodoid.join('');

        let boletinid = $rq.params.boletinid;
            boletinid = boletinid.match(/[a-z0-9]/gi);
            boletinid = boletinid.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' GET /models/model/tree/tarea/' + periodoid + '/' + boletinid;

        let where = new Object();
            where.id = periodoid;

        $db
            .select('ONE')
            .from('boletin')
            .where(where)
            .done((result,rows)=>{

                if(result===true) {

                    for(x in rows[0].item) {
                        if(rows[0].item[x].id===boletinid) {

                            $log
                                .to('tree')
                                .write(log,'success');

                            $rs.json(rows[0].item[x].tareas);

                        }
                    }

                }

                else {

                    $log
                        .to('tree')
                        .write(log,'errors');

                    $rs.sendStatus(404);

                }

            });

    } else $rs.senStatus(404);
});
//$router.put('/tarea/:periodoid/:boletinid:ok
$router.put('/tarea/:periodoid/:boletinid',($rq,$rs) => {
    if($rq.session.status===true){
        
        let periodoid = $rq.params.periodoid;
            periodoid = periodoid.match(/[a-z0-9]/gi);
            periodoid = periodoid.join('');

        let boletinid = $rq.params.boletinid;
            boletinid = boletinid.match(/[a-z0-9]/gi);
            boletinid = boletinid.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' PUT /models/model/tree/tarea/' + periodoid + '/' +boletinid;

        let tarea = new Object();
            tarea.titulo = $rq.body.titulo;
            tarea.titulo = tarea.titulo.match(/[0-9a-zàèìòùÀÈÌÒÙñÑ\.\,\;\ ]/gi);
            tarea.titulo = tarea.titulo.join('');
            tarea.tarea = $rq.body.tarea;
            tarea.tarea = tarea.tarea.match(/[0-9a-záéíóúÁÉÍÓÚñÑ\<\>\=\"\'\.\,\;\ ]/gi);
            tarea.tarea = tarea.tarea.join('');

        let index = $rq.body.index;
            index = index.toString();
            index = index.match(/[0-9]/gi);
            index = index.join('');

        let where = new Object();
            where.id = periodoid;

            $db
                .select('ONE')
                .from('boletin')
                .where(where)
                .done((result,rows)=>{

                    if(result===true){

                        result = false;

                        for(x in rows[0].item){

                            if(rows[0].item[x].id===boletinid){

                                rows[0].item[x].tareas[index] = tarea;
                                result = true;

                            }

                        }

                        if(result===true){

                            $db
                                .update('boletin')
                                .set({item:rows[0].item})
                                .done((result,rows)=>{

                                    if(result===true){

                                        $log
                                            .to('tree')
                                            .write(log,'success');
                                        $rs.json({result:true,rows:null});

                                    }

                                    else {

                                        $log
                                            .to('tree')
                                            .write(log,'errors');
                                        $rs.sendStatus(404);

                                    }

                                })
                        }

                    }

                });

    } else $rs.sendStatus(404);
});
// $router.delete('/tarea/:periodoid/:boletinid/:index:ok
$router.delete('/tarea/:periodoid/:boletinid/:index',($rq,$rs) => {
    if($rq.session.status===true){

        let periodoid = $rq.params.periodoid;
            periodoid = periodoid.match(/[a-z0-9]/gi);
            periodoid = periodoid.join('');

        let boletinid = $rq.params.boletinid;
            boletinid = boletinid.match(/[a-z0-9]/gi)
            boletinid = boletinid.join('');

        let index = $rq.params.index;
            index = index.match(/[a-z0-9]/gi);
            index = index.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' DELETE /models/model/tree/' + periodoid + '/' + boletinid + '/' + index;

        let where = new Object();
            where.id = periodoid;

            $db
                .select('ONE')
                .from('boletin')
                .where(where)
                .done((result,rows)=>{
                    if(result===true){

                        for(x in rows[0].item){
                            if(rows[0].item[x].id===boletinid){
                                let tareas = new Array();
                                    for(i in rows[0].item[x].tareas){
                                        if(i!=index) tareas.push(rows[0].item[x].tareas[i]);
                                    }
                                    rows[0].item[x].tareas = tareas;
                            }
                        }

                        $db
                            .update('boletin')
                            .set({item:rows[0].item})
                            .done((result,rows)=>{

                                if(result===true){

                                    $log
                                        .to('tree')
                                        .write(log,'success');
                                    $rs.json({result:true,rows:null});

                                }

                                else {

                                    $log
                                        .to('tree')
                                        .write(log,'errors');
                                    $rs.sendStatus(404);

                                }

                            });
                    }
                });

    } else $rs.sendStatus(404);
});

// Exportar.
// $router.post('/exportar/word/:file:ok
$router.post('/exportar/word/:file',($rq,$rs)=>{
    if($rq.session.status===true){

        let file = $rq.params.file;
            file = file.match(/[0-9\-]/g);
            file = file.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' POST /models/model/tree/exportar/word/' +  file;

        let path = file + '.html';
            path = $path.join(__dirname,'/model.tree.js.files/html/',path);
        
        let pathw = file + '.docx';
            pathw = $path.join(__dirname,'/model.tree.js.files/word/',pathw);
        
            $fs.readFile(path,{encoding:'utf8'},(error,html)=>{
                if(error===null){
                    html = html
                            .replace(/size="4"/g,'size="3"')
                            .replace(/size="3"/g,'size="2"')
                            .replace(/size="2"/g,'size="1"')
                            .replace(/width="160px"/g,'width="110px"')
                            .replace(/width="70px"/g,'width="40px"')
                            .replace(/width="65px"/g,'width="45px"');
                    
                    let docx = $HtmlDocx.asBlob(html);

                        $fs.writeFile(pathw,docx, function (error){

                            if(error===null){
                                
                                $log
                                    .to('tree')
                                    .write(log,'success');
                                $rs.json({result:true,rows:null});

                            }
                            
                            else {

                                $log
                                    .to('tree')
                                    .write(log,'errors');
                                $rs.sendStatus(404);
                            }

                        });

                }
            });

    } else $rs.sendStatus(404)(); 
});
// $router.get('/exportar/word/:file:ok
$router.get('/exportar/word/:file',($rq,$rs)=>{
    if($rq.session.status===true){

        let file = $rq.params.file;
            file = file.match(/[0-9\-]/gi);
            file = file.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' GET /models/model/tree/exportar/word/' + file;

        let pathw = file + '.docx';
            pathw = $path.join(__dirname,'/model.tree.js.files/word/',pathw);

            $fs.readFile(pathw,'binary',(error,word)=>{
                
                if(error===null){

                    $log
                        .to('tree')
                        .write(log,'success');

                    $rs.setHeader('Content-Type','application/msword');
                    $rs.setHeader('Content-Length',word.length);
                    $rs.setHeader('Content-Disposition','attachment; filename='+file+'.docx'); 
                    $rs.write(word, 'binary');
                    $rs.end();
                }

                else {

                    $log
                        .to('tree')
                        .write(log,'errors');

                    $rs.sendStatus(404);

                }

            });

    } else $rs.sendStatus(404);
});
/*router.post('/exportar/web/:file',(rq,rs,n)=>{
    if(rq.session.status===true){
        let elements = rq.params.file.match(/[0-9\-\.]/g).join('').split('.');
        let path  = 'item[';
            path += elements[0];
            path += ']';
            path += '.item[';
            path += elements[1];
            path += ']';
            db.select({
                model:'boletin',
                path:path,
                callback:(bol,regs)=>{
                    if(bol===true){
                        let sql = "CALL electronjsDDSBoletinInsert("
                            sql += "'"+regs.periodo+"',";
                            sql += "'"+regs.sesion+"',";
                            sql += "'"+regs.forma+"',";
                            sql += "'"+regs.fecha+' '+regs.hora+"',";
                            sql += "'"+regs.numero+"',";
                            sql += "'"+regs.anio+"',";
                            sql += "'"+regs.desde+"',";
                            sql += "'"+regs.hasta+"',";
                            sql += "'"+regs.observ+"',";
                            sql += "'"+regs.text.replace('/','-')+"'";
                            sql += ")";
                        let conf = fs.readFileSync(__dirname+'/../conf/mysql.json','UTF-8');
                            conf = JSON.parse(conf);
                        let mysql = Mysql.createConnection(conf);
                            mysql.connect((e)=>{
                                if(e===null){
                                    mysql.query(sql,(error,rows)=>{
                                        if(error===null){
                                            let json = JSON.parse(JSON.stringify(rows[0]))[0].json;
                                            let pdf  = __dirname + '/model.tree.js.files/pdf/' + elements[2] + '.pdf';
                                            let html = __dirname + '/model.tree.js.files/html/' + elements[2] + '.html';
                                            let server  = fs.readFileSync(__dirname + '/../conf/ssh.json','UTF-8');
                                                server  = JSON.parse(server);
                                            let file =  server.username + ':';
                                                file += server.password + '@';
                                                file += server.host + ':';
                                                file += server.port + ':';
                                                file += '/var/www/html/img/mods/admindds/' + elements[2];
                                                sshclient.scp(pdf,file+'.pdf',(e)=>{if(e===null){
                                                    sshclient.scp(html,file+'.html',(e)=>{
                                                        let user = rq.session.user;
                                                        let text = user.apellido + ' ' + user.nombre + ' POST: /models/model/tree/exportar/web/' + file + '.';
                                                        let pathg = '';
                                                            if(e===null) pathg = __dirname + '/model.tree.js.logs/success.log';
                                                            else pathg = __dirname + '/model.tree.js.logs/errors.log';
                                                                log.set(pathg,text);
                                                            if(e===null){
                                                                mysql.end();
                                                                sshclient.close();
                                                                rs.send(json);
                                                            } else $rs.send({result:false,rows:null});
                                                    });
                                                } else $rs.send({result:false,rows:null}); });
                                        } else $rs.send({result:false,rows:null});
                                    });
                                } else $rs.send({result:false,rows:null});
                            });
                    } else $rs.status(404).send();
                }
            });
    } else $rs.status(404).send();
});*/
//$router.post('/exportar/pdf/:file:ok
$router.post('/exportar/pdf/:file',($rq,$rs)=>{
    if($rq.session.status===true){

        let file = $rq.params.file;
            file = file.match(/[0-9\-]/gi);
            file = file.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' POST /models/model/tree/exportar/pdf/' + file;

        let path = file + '.html';
            path = $path.join(__dirname + '/model.tree.js.files/html/',path);

        let pathp = file + '.pdf';
            pathp = $path.join(__dirname + '/model.tree.js.files/pdf/',pathp);
        
            $fs.readFile(path,{encoding:'utf8'},(error,html)=>{

                if(error===null){

                    let config = {
                            format:'A4',
                            orientation:'portrait',
                            border:'15mm'
                        };

                        html = html
                            .replace(/size="4"/gm,'size="3"')
                            .replace(/size="3"/gm,'size="2"')
                            .replace(/size="2"/gm,'size="1"')
                            .replace(/width="160px"/gm,'width="110px"')
                            .replace(/width="70px"/gm,'width="25px"')
                            .replace(/width="65px"/gm,'width="30px"');
        
                        $htmlPdf
                            .create(html,config)
                            .toFile(pathp,(error)=>{

                                if(error===null) {

                                    $log
                                        .to('tree')
                                        .write(log,'success');
                                    $rs.json({result:true,rows:null});

                                }

                                else {

                                    $log
                                        .to('tree')
                                        .write(log,'errors');
                                    $rs.sendStatus(404);

                                }

                            });
                } else $rs.sendStatus(404);

            });

    } else $rs.sendStatus(404);
});
//router.get('/exportar/pdf/:file':ok
$router.get('/exportar/pdf/:file',($rq,$rs)=>{
    if($rq.session.status===true){

        let file = $rq.params.file;
            file = file.match(/[0-9\-]/gi);
            file = file.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' GET  /models/model/tree/exportar/pdf/' + file;

        let path = file + '.pdf';
            path = $path.join(__dirname,'/model.tree.js.files/pdf/',path);
        
            $fs.readFile(path,'binary',(error,data)=>{
        
                if(error===null){

                    $log
                        .to('tree')
                        .write(log,'success');

                    $rs.setHeader('Content-Type','application/pdf');
                    $rs.setHeader('Content-Length',data.length);
                    $rs.setHeader('Content-Disposition','attachment; filename='+file+'.pdf'); 
                    $rs.write(data, 'binary');
                    $rs.end();

                }

                else {

                    $log
                        .to('tree')
                        .write(log,'errors');

                    $rs.sendStatus(404);

                }

            });
    } else $rs.sendStatus(404);
});

/*// Remoto.
router.get('/remote/boletines',(rq,rs,n)=>{
    if(rq.session.status===true){
        let sql = "CALL electronjsDDSBoletines();";
        let conf = fs.readFileSync(__dirname+'/../conf/mysql.json','UTF-8');
            conf = JSON.parse(conf);
        let mysql = Mysql.createConnection(conf);
            mysql.connect((e)=>{
                if(e===null){
                    mysql.query(sql,(e,r)=>{
                        let user = rq.session.user;
                        let text = user.apellido + ' ' + user.nombre + ' GET: /models/model/tree/remote/boletines.';
                        let pathg = '';
                            if(e) pathg = __dirname + '/model.tree.js.logs/success.log';
                            else pathg = __dirname + '/model.tree.js.logs/errors.log';

                            log.set(pathg,text);

                            if(e===null){
                                let json = JSON.parse(JSON.stringify(r[0]))[0].json;
                                    json = JSON.parse(json);
                                    if(json.result===true){
                                        mysql.end();
                                        rs.send(json);
                                    } else $rs.send({result:false,rows:null});
                            } else $rs.send({result:false,rows:null});
                    });
                } else $rs.send({result:false,rows:null});
            });
    } else $rs.status(404).send();
});
router.delete('/remote/boletin/:id/:fname',(rq,rs,n)=>{
    if(rq.session.status===true){
        let id = rq.params.id.match(/[0-9]/g).join('');
        let fname = rq.params.fname.match(/[0-9\-]/g).join('');
        let sql = "CALL electronjsDDSBoletinDelete(" + id + ");";
        let conf = fs.readFileSync(__dirname+'/../conf/mysql.json','UTF-8');
            conf = JSON.parse(conf);
        let mysql = Mysql.createConnection(conf);
            mysql.connect((e)=>{
                if(e===null){
                    mysql.query(sql,(e,r)=>{
                        if(e===null){
                            let json = JSON.parse(JSON.stringify(r[0]))[0].json;
                                json = JSON.parse(json);
                                if(json.result===true){
                                    let server = fs.readFileSync(__dirname + '/../conf/ssh.json','UTF-8');
                                        server = JSON.parse(server);
                                    let cmd = 'rm /var/www/html/img/mods/admindds/' + fname + '.*';
                                    let callback = (e,sout,serr)=>{
                                        let user = rq.session.user;
                                        let text = user.apellido + ' ' + user.nombre + ' DELETE: /models/model/tree/remote/boletin/' + id + '/' + fname + '.';
                                        let pathg = '';

                                            if(e) pathg = __dirname + '/model.tree.js.logs/success.log';
                                            else pathg = __dirname + '/model.tree.js.logs/errors.log';

                                            log.set(pathg,text);

                                            if(e===undefined){
                                                mysql.end();
                                                sshexec({cmd:'exit'},()=>{});
                                                rs.send(json);
                                            }
                                        };
                                        sshconn(server,(e,ssh)=>{
                                            if(e===null) sshexec({cmd:cmd,ssh:ssh},callback);
                                        });
                                } else $rs.send({result:false,rows:null});
                        } else $rs.send({result:false,rows:null});
                    });
                } else $rs.send({result:false,rows:null});
            });
    } else $rs.status(404).send();
});*/


// Autoridades.
//$router.get('/autoridades':ok
$router.get('/autoridades', ($rq,$rs)=>{
    if($rq.session.status===true){

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' GET /models/model/tree/autoridades';
            
            $db
                .select('ONE')
                .from('autoridades')
                .done((result,rows)=>{
                    if(result===true){

                        $log
                            .to('tree')
                            .write(log,'success');

                        $rs.json({result:true,rows:rows[0]});
                    }

                    else {

                        $log
                            .to('tree')
                            .write(log,'errors');

                        $rs.sendStatus(404);

                    }
                });

    } else $rs.sendStatus(404);
});
//$router.put('/autoridades':
$router.put('/autoridades',($rq,$rs)=>{
    if($rq.session.status===true){

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' PUT /models/model/tree/autoridades';

        let autoridades = new Object();
            autoridades.presidente      = $rq.body.presidente.match(new RegExp('[0-9a-záéíóúÁÉÍÓÚñÑ\.\ ]','gi')).join('');
            autoridades.vicepresidente1 = $rq.body.vicepresidente1.match(new RegExp('[0-9a-záéíóúÁÉÍÓÚñÑ\.\ ]','gi')).join('');
            autoridades.vicepresidente2 = $rq.body.vicepresidente2.match(new RegExp('[0-9a-záéíóúÁÉÍÓÚñÑ\.\ ]','gi')).join('');
            autoridades.parlamentario   = $rq.body.parlamentario.match(new RegExp('[0-9a-záéíóúÁÉÍÓÚñÑ\.\ ]','gi')).join('');
            autoridades.administrativo  = $rq.body.administrativo.match(new RegExp('[0-9a-záéíóúÁÉÍÓÚñÑ\.\ ]','gi')).join('');

        let path = $path.join(__dirname,'/../database/autoridades.db');

            $fs.readFile(path,'utf8',(error,data)=>{
                if(error===null){
                    
                    let table = JSON.parse(data);
                        table[0] = autoridades;
                        table = JSON.stringify(table);

                        $fs.writeFile(path,table,'utf8',(error)=>{
                            
                            if(error===null) {

                                $log
                                    .to('tree')
                                    .write(log,'success');

                                $rs.json({result:true,rows:null});

                            }

                            else {

                                $log
                                    .to('tree')
                                    .write(log,'errors');
                                $rs.sendStatus(404);
                            }

                        });

                }
            })
    } else $rs.sendStatus(404);
});

// Super respaldo.
// $router.get('/super/respaldo/load':ok
$router.get('/super/respaldo/load',(rq,$rs)=>{
    if(rq.session.status===true){
        let log =  rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log += ' GET: /models/model/tree/super/respaldo/load';

        let dpath = $path.join(__dirname,'/../database/backup');
            $fs.readdir(dpath,{encoding:'utf8'},(e,f)=>{
                if(e===null){
                    let rows = {rows:[]};
                        for(let i in f) rows.rows.push({
                            id:i,
                            data:[
                                f[i],
                                '<button type="button" onclick="window.respaldosRestore(\''+f[i]+'\')"><img src="./icons/database_refresh.png"/></button>',
                                '<button type="button" onclick="window.respaldosDelete(\''+f[i]+'\')"><img src="./icons/database_delete.png"/></button>'
                            ]
                        });
                        rows.rows.sort((a,b)=>{return b.id-a.id;});

                        $log
                            .to('tree')
                            .write(log,'success');
                        $rs
                            .type('json')
                            .set({'Content-Type':'application/json'})
                            .send(rows)
                            .end();
                } 
                else {
                    $log
                        .to('tree')
                        .write(log,'errors');
                    $rs
                        .sendStatus(404)
                        .end();
                }
            },{options:'utf8'});

    } else $rs.sendStatus(404).end();
});
// $router.put('/super/respaldo/restore/:dname':ok
$router.put('/super/respaldo/restore/:dname',(rq,$rs)=>{
    if(rq.session.status===true){

        let log = rq.params.dname;
            log = log.match(/[0-9\_]/gi);
            log = log.join('');
            log = ' PUT: /models/model/tree/super/respaldo/restore/' + log;
            log = rq.session.user.nombre + ' ' + rq.session.user.apellido + log;
            
        let tname = $path.join(__dirname,'/../database');

        let dname = rq.params.dname;
            dname = dname.match(/[0-9\_]/gi);
            dname = dname.join('');
            dname = $path.join(__dirname,'/../database/backup/',dname);

            $fs.copyFile(dname+'/autoridades.db',tname+'/autoridades.db',(e)=>{
                if(e===null){
                    $fs.copyFile(dname+'/boletin.db',tname+'/boletin.db',(e)=>{
                        if(e===null){
                            $fs.copyFile(dname+'/usuarios.db',tname+'/usuarios.db',(e)=>{
                                if(e===null){
                                    $log
                                        .to('tree')
                                        .write(log,'success');
                                    $rs
                                        .type('json')
                                        .set({'Content-Type':'application/json'})
                                        .send({result:true,rows:null})
                                        .end();
                                }
                                else{
                                    $log
                                        .to('tree')
                                        .write(log,'errors');
                                    $rs
                                        .sendStatus(404)
                                        .end();
                                }
                            });
                        } else $rs.sendStatus(404).end();
                    });
                } else $rs.sendStatus(404).end();
            });
    }
});
// $router.delete('/super/respaldo/delete/:dname':ok
$router.delete('/super/respaldo/delete/:dname',(rq,$rs)=>{
    if(rq.session.status===true){

        let log = rq.params.dname;
            log = log.match(/[0-9\_]/gi);
            log = log.join('');
            log = ' DELETE: /models/model/tree/super/respaldo/restore/' + log;
            log = rq.session.user.nombre + ' ' + rq.session.user.apellido + log;

        let dname = rq.params.dname;
            dname = dname.match(/[0-9\_]/gi);
            dname = dname.join('');
            dname = $path.join(__dirname,'/../database/backup/',dname);


            $fs.unlink(dname+'/autoridades.db',(e)=>{
                if(e===null){
                    $fs.unlink(dname+'/boletin.db',(e)=>{
                        if(e===null){
                            $fs.unlink(dname+'/usuarios.db',(e)=>{
                                if(e===null){
                                    $fs.rmdir(dname,(e)=>{
                                        if(e===null){
                                            $log
                                                .to('tree')
                                                .write(log,'success');
                                            $rs
                                                .type('json')
                                                .set({'Content-Type':'application/json'})
                                                .send({result:true,rows:null})
                                                .end();
                                        }
                                        else{
                                            $log
                                                .to('tree')
                                                .write(log,'errors');
                                            $rs
                                                .sendStatus(404)
                                                .end();
                                        }
                                    });
                                } else $rs.sendStatus(404).end();
                            });
                        } else $rs.sendStatus(404).end();
                    });
                } else $rs.sendStatus(404).end();
            });
    }
});

// Super descargas.
// $router.get('/super/descargas/load':ok
$router.get('/super/descargas/load',(rq,$rs)=>{
    if(rq.session.status===true){

        let log =  rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log += ' GET: /models/model/tree/super/respaldo/load';

        let dpath = $path.join(__dirname,'/../database/backupzip');
            $fs.readdir(dpath,{encoding:'utf8'},(e,f)=>{
                if(e===null){
                    let rows = {rows:[]};
                        for(let i in f) rows.rows.push({
                            id:i,
                            data:[
                                f[i],
                                '<button type="button" onclick="window.descargasDownload(\''+f[i]+'\')"><img src="./icons/package_link.png"/></button>',
                                '<button type="button" onclick="window.descargasDelete(\''+f[i]+'\')"><img src="./icons/package_delete.png"/></button>'
                            ]
                        });
                        rows.rows.sort((a,b)=>{return b.id-a.id;});

                        $log
                            .to('tree')
                            .write(log,'success');
                        $rs
                            .type('json')
                            .set({'Content-Type':'application/json'})
                            .send(rows)
                            .end();
                } 
                else {
                    $log
                        .to('tree')
                        .write(log,'errors');
                    $rs
                        .sendStatus(404)
                        .end();
                }
            },{options:'utf8'});

    } else $rs.sendStatus(404).end();

});
// $router.get('/super/descargas/download/:dname':ok
$router.get('/super/descargas/download/:dname',(rq,$rs)=>{
    if(rq.session.status===true){

        let log = rq.params.dname;
            log = log.match(/[0-9\_]/gi);
            log = log.join('');
            log = ' GET: /models/model/tree/super/descargas/dowload/' + log;
            log = rq.session.user.nombre + ' ' + rq.session.user.apellido + log;

        let dname = rq.params.dname;
            dname = dname.match(/[0-9\_]/gi);
            dname = dname.join('');
            dname = $path.join(__dirname,'/../database/backupzip/') + dname + '.zip';

            $fs.readdir(dpath,{encoding:'utf8'},(e,data)=>{
                if(e===null){
                    
                        $log
                            .to('tree')
                            .write(log,'success');
                        $rs
                            .type('json')
                            .set({'Content-Type':'application/zip'})
                            .send(data)
                            .end();
                } 
                else {
                    $log
                        .to('tree')
                        .write(log,'errors');
                    $rs
                        .sendStatus(404)
                        .end();
                }
            },{options:'utf8'});

    } else $rs.sendStatus(404).end();

});
// $router.delete('/super/descargas/delete/:dname':ok
$router.delete('/super/descargas/delete/:dname',(rq,$rs)=>{
    if(rq.session.status===true){

        let log = rq.params.dname;
            log = log.match(/[0-9zip\_\.]/gi);
            log = log.join('');
            log = ' DELETE: /models/model/tree/super/descargas/delete/' + log;
            log = rq.session.user.nombre + ' ' + rq.session.user.apellido + log;

        let dname = rq.params.dname;
            dname = dname.match(/[0-9zip\_\.]/gi);
            dname = dname.join('');
            dname = $path.join(__dirname,'/../database/backupzip/',dname);

            $fs.unlink(dname,(e)=>{
                if(e===null){
                    $log
                        .to('tree')
                        .write(log,'success');
                    $rs
                        .type('json')
                        .set({'Content-Type':'application/json'})
                        .send({result:true,rows:null})
                        .end();
                }
                else $rs.sendStatus(404).end();
            });
    }

});

// Super Logs Auth.
// $router.get('/super/logauth/success/load':ok
$router.get('/super/logauth/success/load',(rq,$rs)=>{
    if(rq.session.status===true){

        let logw =  rq.session.user.nombre + ' ' + rq.session.user.apellido;
            logw += ' GET: /models/model/tree/super/logauth/success/load';

        let path = $path.join(__dirname,'/../models/model.auth.js.logs/success.log');
            $fs.readFile(path,{encoding:'utf8'},(e,f)=>{
                if(e===null){

                    let log  = JSON.parse(f);
                    let rows = {rows:[]};

                        for(i in log) rows.rows.push({
                            id:i,
                            data:[log[i]]
                        });

                        $log
                            .to('tree')
                            .write(logw,'success');
                        $rs
                            .type('json')
                            .set({'Content-Type':'application/json'})
                            .send(rows)
                            .end();
                } 
                else {
                    $log
                        .to('tree')
                        .write(logw,'errors');
                    $rs
                        .sendStatus(404)
                        .end();
                }
            },{options:'utf8'});

    } else $rs.sendStatus(404).end();

});
// $router.get('/super/logauth/errors/load':ok
$router.get('/super/logauth/errors/load',(rq,$rs)=>{
    if(rq.session.status===true){

        let logw =  rq.session.user.nombre + ' ' + rq.session.user.apellido;
        logw += ' GET: /models/model/tree/super/logauth/errors/load';

    let path = $path.join(__dirname,'/../models/model.auth.js.logs/errors.log');
        $fs.readFile(path,{encoding:'utf8'},(e,f)=>{
            if(e===null){

                let log  = JSON.parse(f);
                let rows = {rows:[]};

                    for(i in log) rows.rows.push({
                        id:i,
                        data:[log[i]]
                    });

                    $log
                        .to('tree')
                        .write(logw,'success');
                    $rs
                        .type('json')
                        .set({'Content-Type':'application/json'})
                        .send(rows)
                        .end();
            } 
            else {
                $log
                    .to('tree')
                    .write(logw,'errors');
                $rs
                    .sendStatus(404)
                    .end();
            }
        },{options:'utf8'});

    } else $rs.sendStatus(404).end();

});

// Super Logs Tree.
// $router.get('/super/logtree/success/load':ok
$router.get('/super/logtree/success/load',(rq,$rs)=>{
    if(rq.session.status===true){

        let logw =  rq.session.user.nombre + ' ' + rq.session.user.apellido;
            logw += ' GET: /models/model/tree/super/logtree/success/load';

        let path = $path.join(__dirname,'/../models/model.tree.js.logs/success.log');
            $fs.readFile(path,{encoding:'utf8'},(e,f)=>{
                if(e===null){

                    let log  = JSON.parse(f);
                    let rows = {rows:[]};

                        for(i in log) rows.rows.push({
                            id:i,
                            data:[log[i]]
                        });

                        $log
                            .to('tree')
                            .write(logw,'success');
                        $rs
                            .type('json')
                            .set({'Content-Type':'application/json'})
                            .send(rows)
                            .end();
                } 
                else {
                    $log
                        .to('tree')
                        .write(logw,'errors');
                    $rs
                        .sendStatus(404)
                        .end();
                }
            },{options:'utf8'});

    } else $rs.sendStatus(404).end();

});
// $router.get('/super/logtree/errors/load':ok
$router.get('/super/logtree/errors/load',(rq,$rs)=>{
    if(rq.session.status===true){

        let logw =  rq.session.user.nombre + ' ' + rq.session.user.apellido;
            logw += ' GET: /models/model/tree/super/logtree/errors/load';

        let path = $path.join(__dirname,'/../models/model.tree.js.logs/errors.log');
            $fs.readFile(path,{encoding:'utf8'},(e,f)=>{
                if(e===null){

                    let log  = JSON.parse(f);
                    let rows = {rows:[]};

                        for(i in log) rows.rows.push({
                            id:i,
                            data:[log[i]]
                        });

                        $log
                            .to('tree')
                            .write(logw,'success');
                        $rs
                            .type('json')
                            .set({'Content-Type':'application/json'})
                            .send(rows)
                            .end();
                } 
                else {
                    $log
                        .to('tree')
                        .write(logw,'errors');
                    $rs
                        .sendStatus(404)
                        .end();
                }
            },{options:'utf8'});

    } else $rs.sendStatus(404).end();

});

// Super Logs User.
//$router.get('/super/loguser/success/load':ok
$router.get('/super/loguser/success/load',(rq,$rs)=>{
    if(rq.session.status===true){

        let logw =  rq.session.user.nombre + ' ' + rq.session.user.apellido;
        logw += ' GET: /models/model/tree/super/loguser/success/load';

    let path = $path.join(__dirname,'/../models/model.usuarios.js.logs/success.log');
        $fs.readFile(path,{encoding:'utf8'},(e,f)=>{
            if(e===null){

                let log  = JSON.parse(f);
                let rows = {rows:[]};

                    for(i in log) rows.rows.push({
                        id:i,
                        data:[log[i]]
                    });

                    $log
                        .to('tree')
                        .write(logw,'success');
                    $rs
                        .type('json')
                        .set({'Content-Type':'application/json'})
                        .send(rows)
                        .end();
            } 
            else {
                $log
                    .to('tree')
                    .write(logw,'errors');
                $rs
                    .sendStatus(404)
                    .end();
            }
        },{options:'utf8'});

    } else $rs.sendStatus(404).end();

});
// $router.get('/super/loguser/errors/load':ok
$router.get('/super/loguser/errors/load',(rq,$rs)=>{
    if(rq.session.status===true){

        let logw =  rq.session.user.nombre + ' ' + rq.session.user.apellido;
        logw += ' GET: /models/model/tree/super/loguser/errors/load';

    let path = $path.join(__dirname,'/../models/model.usuarios.js.logs/errors.log');
        $fs.readFile(path,{encoding:'utf8'},(e,f)=>{
            if(e===null){

                let log  = JSON.parse(f);
                let rows = {rows:[]};

                    for(i in log) rows.rows.push({
                        id:i,
                        data:[log[i]]
                    });

                    $log
                        .to('tree')
                        .write(logw,'success');
                    $rs
                        .json(rows)
                        .end();
            } 
            else {
                $log
                    .to('tree')
                    .write(logw,'errors');
                $rs.sendStatus(404);
            }
        },{options:'utf8'});

    } else $rs.sendStatus(404);

});

module.exports = $router;