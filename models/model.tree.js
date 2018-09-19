var $fs       = require('fs');
var $path     = require('path');
var $db       = require('../library/model.api');
var $log      = require('../library/log.api');
var $unique   = require('uniqid');
var $express  = require('express');
var $router   = $express.Router();
var $base64   = require('base-64');
var $htmlPdf  = require('html-pdf');
var $HtmlDocx  = require('html-docx-js');
var $Mysql     = require('mysql');
var $sshconn   = require('ssh2-connect');
var $sshexec   = require('ssh2-exec');
var $sshclient = require('scp2');

$router.all('/',(rq,$rs,n)=>{
    $rs.sendStatus(404);
});

// Tree content.
$router.get('/init',(rq,$rs,n) => {
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
$router.post('/periodo',(rq,$rs,n) => {
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
$router.get('/periodo/:id',(rq,$rs,n) => {
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
$router.put('/periodo/:id',(rq,$rs,n) => {
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
$router.delete('/periodo/:id',(rq,$rs,n) => {
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
                            .sendStaqtus(404)
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
/*$router.get('/boletin/:indexes',(rq,rs,n)=>{
    if(rq.session.status===true){
        let i = rq.params.indexes.match(new RegExp('[0-9.]','g')).join('').split('.');
        let indexp = i[0];
        let indexb = i[1];
            db.select({
                model:'boletin',
                path:'item['+indexp+'].item['+indexb+']',
                callback:(bol,regs)=>{
                    let user = rq.session.user;
                    let text = user.apellido + ' ' + user.nombre + ' GET: /models/model/tree/boletin' + i +'.';
                    let path = '';
                        if(bol) path = __dirname + '/model.tree.js.logs/success.log';
                        else path = __dirname + '/model.tree.js.logs/errors.log';
                        log.set(path,text);
                        rs.send({result:bol,rows:regs});
                }
            });
    } else $rs.status(404).send();
})*/

//router.get('/boletin/:file/html':ok
$router.get('/boletin/:file/html',(rq,$rs,n) => {
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
//router.put('/boletin/:file/html':
$router.put('/boletin/:file/html',($rq,$rs)=>{
    if($rq.session.status===true){

        let file = $rq.params.file;
            file = file.match(/[0-9\-]/gi);
            file = file.join('');

        let log = $rq.session.user.nombre + ' ' + $rq.session.user.apellido;
            log = log + ' PUT /boletin/' + file + '/html';
        
            file = file + '.html';

        let path = $path.join(__dirname,'/model.tree.js.files/html/',file);

        let html = $rq.rawBody;
            //html = html.match(/[a-z0-9áéíóúÁÉÍÓÚñÑ\:\ \<\>\/\.\"\=\!\-\.\;]/gim);
            //html = $base64.decode(html);
            console.log(path,html);

            $fs.writeFile(path,html,{encoding:'utf8'},(error)=>{
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
/*router.put('/boletin/:file/bloquear',(rq,rs,n)=>{
    if(rq.session.status===true){
        let file = rq.params.file.match(/[0-9\-]/gi).join('') + '.html';
        let fpath = path.join(__dirname,'/model.tree.js.files/html/',file);
        console.log(file,fpath);
        fs.readFile(fpath,{encoding:'utf-8'},(e,data)=>{
            if(e===null){
                data = data.replace(/contenteditable="true"/gi,'contenteditable="false"');
                fs.writeFile(fpath,data,(e)=>{
                    if(e===null) rs.send({result:true,rows:null});
                    else $rs.send({result:false,rows:null});
                });
            } else $rs.send({result:false,rows:null});
        });
    } else $rs.status(404).send();
});
router.put('/boletin/:file/desbloquear',(rq,rs,n)=>{
    if(rq.session.status===true){
        let file = rq.params.file.match(/[0-9\-]/gi).join('') + '.html';
        let fpath = path.join(__dirname,'/model.tree.js.files/html/',file);
        fs.readFile(fpath,{encoding:'utf-8'},(e,data)=>{
            if(e===null){
                data = data.replace(/contenteditable="false"/gi,'contenteditable="true"');
                fs.writeFile(fpath,data,(e)=>{
                    if(e===null) rs.send({result:true,rows:null});
                    else $rs.send({result:false,rows:null});
                });
            } else $rs.send({result:false,rows:null});
        });
    } else $rs.status(404).send();
});*/
//$router.delete('/boletin/:periodoid/:boletinid/:boletinfile':ok
$router.delete('/boletin/:periodoid/:boletinid/:boletinfile', (rq,$rs,n) => {
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


/*// Tareas.
router.post('/tarea',(rq, rs, n) => {
    if(rq.session.status===true){
        let model  = db.getModel('boletin');
        let indexp = rq.body.indexp.match(/[0-9]/g).join('');
        let indexb = rq.body.indexb.match(/[0-9]/g).join('');
        let indext = model.item[indexp].item[indexb].tareas.length;
        let tarea  = new Object();
            tarea.titulo = rq.body.titulo.match(new RegExp('[0-9a-z\ ' + chars + ']','gi')).join('');
            tarea.tarea = rq.body.tarea.match(new RegExp('[0-9a-z\<\>\"\'\=\;\ ' + chars + ']','gi')).join('');
        let path  = 'item[';
            path += indexp;
            path += ']';
            path += '.item[';
            path += indexb;
            path += '].tareas[';
            path += indext
            path += ']'; 
            db.insert({
                model:'boletin',
                path:path,
                value:tarea,
                callback:(bol,regs)=>{
                    let user = rq.session.user;
                    let text = user.apellido + ' ' + user.nombre + ' POST: /models/model/tree/tarea.';
                    let path = '';
                        if(bol) path = __dirname + '/model.tree.js.logs/success.log';
                        else path = __dirname + '/model.tree.js.logs/errors.log';
                        log.set(path,text);
                    rs.send({result:bol,rows:regs});
                }
            });
    } else $rs.status(404).send();
});
router.get('/tareas/:indexes',  (rq, rs, n) => {
    if(rq.session.status===true){
        let indexes = rq.params.indexes.match(/[0-9.]/g).join('').split('.');
        let path = 'item[';
            path += indexes[0];
            path += '].item[';
            path += indexes[1];
            path += '].tareas';
            db.select({
                model:'boletin',
                path:path,
                callback:(bol,regs)=>{
                    let user = rq.session.user;
                    let text = user.apellido + ' ' + user.nombre + ' GET: /models/model/tree/tareas/' + indexes.join('.') + '.';
                    let path = '';
                        if(bol) path = __dirname + '/model.tree.js.logs/success.log';
                        else path = __dirname + '/model.tree.js.logs/errors.log';
                        log.set(path,text);
                        rs.send(regs);
                }
            });
    } else $rs.status(404).send();
});
router.put('/tarea',(rq, rs, n) => {
    if(rq.session.status===true){
        rq.body = JSON.parse(rq.body);
        let tarea = new Object();
            tarea.titulo = rq.body.titulo.match(new RegExp('[0-9a-z\ ' + chars + ']','gi')).join('');
            tarea.tarea = rq.body.tarea.match(new RegExp('[0-9a-z\<\>\"\'\=\;\ ' + chars + ']','gi')).join('');
        let path  = 'item[';
            path += rq.body.indexp.toString().match(/[0-9]/g).join('');
            path += ']';
            path += '.item[';
            path += rq.body.indexb.toString().match(/[0-9]/g).join('');
            path += '].tareas[';
            path += rq.body.indext.toString().match(/[0-9]/g).join('');
            path += ']';
            db.update({
                model:'boletin',
                path:path,
                value:tarea,
                callback:(bol,regs) => {
                    let user = rq.session.user;
                    let text = user.apellido + ' ' + user.nombre + ' PUT: /models/model/tree/tarea.';
                    let path = '';
                        if(bol) path = __dirname + '/model.tree.js.logs/success.log';
                        else path = __dirname + '/model.tree.js.logs/errors.log';
                        log.set(path,text);
                        rs.send({result:bol,rows:regs});
                }
            });
    } else $rs.status(404).send();
});
router.delete('/tarea',(rq, rs, n) => {
    if(rq.session.status===true){
        rq.body = JSON.parse(rq.body);
        let path  = 'item[';
            path += rq.body.indexp.toString().match(/[0-9]/g).join('');
            path += ']';
            path += '.item[';
            path += rq.body.indexb.toString().match(/[0-9]/g).join('');
            path += '].tareas[';
            path += rq.body.indext.toString().match(/[0-9]/g).join('');
            path += ']';
            db.delete({
                model:'boletin',
                path:path,
                callback:(bol,regs)=>{
                    let user = rq.session.user;
                    let text = user.apellido + ' ' + user.nombre + ' DELETE: /models/model/tree/tarea.';
                    let path = '';
                        if(bol) path = __dirname + '/model.tree.js.logs/success.log';
                        else path = __dirname + '/model.tree.js.logs/errors.log';
                        log.set(path,text);
                        rs.send({result:bol,rows:regs});
                }
            });
    } else $rs.status(404).send();
});

// Exportar.
router.post('/exportar/word/:file',(rq,rs,n)=>{
    if(rq.session.status===true){
        let path = __dirname + '/model.tree.js.files/word/';
        
        let file = rq.params.file.match(/[0-9\-]/g).join('');
        
        let html  = fs.readFileSync(__dirname + '/model.tree.js.files/html/' + file + '.html',{encoding:'utf8'});
            html = html.replace(/size="4"/g,'size="3"')
                .replace(/size="3"/g,'size="2"')
                .replace(/size="2"/g,'size="1"')
                .replace(/width="160px"/g,'width="110px"')
                .replace(/width="70px"/g,'width="40px"')
                .replace(/width="65px"/g,'width="45px"');

            let docx = HtmlDocx.asBlob(html);

                fs.writeFile(path + file + '.docx',docx, function (e){
                    if(e===null){
                        fs.chmod(path+file+'.docx','755',(e)=>{
                            let user = rq.session.user;
                            let text = user.apellido + ' ' + user.nombre + ' POST: /models/model/tree/exportar/word/' + file + '.';
                            let pathg = '';
                                if(e===null) pathg = __dirname + '/model.tree.js.logs/success.log';
                                else pathg = __dirname + '/model.tree.js.logs/errors.log';
                                log.set(pathg,text);
                                if(e===null) rs.send({result:true,rows:null});
                                else $rs.send({result:false,rows:null});
                        });
                    } else $rs.send({result:false,rows:null}); 
                });
    } else $rs.status(404).send(); 
});
router.get('/exportar/word/:file',(rq,rs,n)=>{
    if(rq.session.status===true){
        let path = __dirname + '/model.tree.js.files/word/';
        let file = rq.params.file.match(/[0-9\-]/g).join('');
        let word = fs.readFileSync(path + file + '.docx','binary');

        let user = rq.session.user;
        let text = user.apellido + ' ' + user.nombre + ' GET: /models/model/tree/exportar/word/' + file + '.';
        let pathf = '';

            if(word) pathf = __dirname + '/model.tree.js.logs/success.log';
            else pathf = __dirname + '/model.tree.js.logs/errors.log';
            log.set(pathf,text);

            rs.setHeader('Content-Type','application/msword');
            rs.setHeader('Content-Length',word.length);
            rs.setHeader('Content-Disposition','attachment; filename='+file+'.docx'); 
            rs.write(word, 'binary');
            rs.end();
    } else $rs.status(404).send();
});
router.post('/exportar/web/:file',(rq,rs,n)=>{
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
});
router.post('/exportar/pdf/:file',(rq,rs,n)=>{
    if(rq.session.status===true){
        let path = __dirname + '/model.tree.js.files/pdf/';
        
        let file = rq.params.file.match(/[0-9\-]/g).join('');
        
        let html = fs.readFileSync(__dirname + '/model.tree.js.files/html/' + file + '.html',{encoding:'utf8'});
            html = html.replace(/size="4"/gm,'size="3"')
                .replace(/size="3"/gm,'size="2"')
                .replace(/size="2"/gm,'size="1"')
                .replace(/width="160px"/gm,'width="110px"')
                .replace(/width="70px"/gm,'width="25px"')
                .replace(/width="65px"/gm,'width="30px"');
        
        let config = {
                format           : 'A4',
                orientation      : 'portrait',
                border           : '0',
                header           : {
                    height       : '50mm',
                    contents     : {
                        first    : '&nbsp;'
                    }
                },
                footer           : {
                    height       : '15mm',
                    contents     : {
                        first    : '&nbsp;'
                    }
                }
            };
        
            htmlPdf
                .create(html,config)
                .toFile(path+file+'.pdf',(e) => {
                    if(e===null){
                        fs.chmod(path+file+'.pdf','755',(e)=>{
                            let user = rq.session.user;
                            let text = user.apellido + ' ' + user.nombre + ' POST: /models/model/tree/pdf/file/' + file + '.';
                            let pathg = '';
                                if(e===null) pathg = __dirname + '/model.tree.js.logs/success.log';
                                else  pathg = __dirname + '/model.tree.js.logs/errors.log';
                                log.set(pathg,text);
                                if(e===null) rs.send({result:true,rows:null});
                                else $rs.send({result:false,rows:null});
                        });
                    } else $rs.send({result:false,rows:null});
                });
    } else $rs.status(404).send();
});
router.get('/exportar/pdf/:file',(rq,rs,n)=>{
    if(rq.session.status===true){
        let path = __dirname + '/model.tree.js.files/pdf/';
        let file = rq.params.file.match(/[0-9\-]/g).join('');
        let pdf = fs.readFileSync(path + file + '.pdf','binary');
        let user = rq.session.user;
        let text = user.apellido + ' ' + user.nombre + ' GET: /models/model/tree/exportar/pdf/' + file + '.';
        let pathf = '';

            if(pdf) pathf = __dirname + '/model.tree.js.logs/success.log';
            else pathf = __dirname + '/model.tree.js.logs/errors.log';

            log.set(pathf,text);

            rs.setHeader('Content-Type','application/pdf');
            rs.setHeader('Content-Length',pdf.length);
            rs.setHeader('Content-Disposition','attachment; filename='+file+'.pdf'); 
            rs.write(pdf, 'binary');
            rs.end();
    } else $rs.status(404).send();
});

// Remoto.
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
});


// Autoridades.
router.get('/autoridades', (rq,rs,n)=>{
    if(rq.session.status===true){
        let path = 'autoridades[0]';
            db.select({
                model:'autoridades',
                path:path,
                callback:(bol,regs)=>{
                    let user = rq.session.user;
                    let text = user.apellido + ' ' + user.nombre + ' GET: /models/model/tree/autoridades.';
                    let pathg = '';
                        
                        if(bol) pathg = __dirname + '/model.tree.js.logs/success.log';
                        else pathg = __dirname + '/model.tree.js.logs/errors.log';
                        
                        log.set(pathg,text);
                        
                        rs.send({result:bol,rows:regs});
                }
            });
    } else $rs.status(404).send();
});
router.put('/autoridades',(rq,rs,n)=>{
    if(rq.session.status===true){
        rq.body = JSON.parse(rq.body);
        let autoridades = new Object();
            autoridades.presidente      = rq.body.presidente.match(new RegExp('[0-9a-z\.\ ' + chars + ']','gi')).join('');
            autoridades.vicepresidente1 = rq.body.vicepresidente1.match(new RegExp('[0-9a-z\.\ ' + chars + ']','gi')).join('');
            autoridades.vicepresidente2 = rq.body.vicepresidente2.match(new RegExp('[0-9a-z\.\ ' + chars + ']','gi')).join('');
            autoridades.parlamentario   = rq.body.parlamentario.match(new RegExp('[0-9a-z\.\ ' + chars + ']','gi')).join('');
            autoridades.administrativo  = rq.body.administrativo.match(new RegExp('[0-9a-z\.\ ' + chars + ']','gi')).join('');
        let path  = 'autoridades[0]';
            db.update({
                model:'autoridades',
                path:path,
                value:autoridades,
                callback:(bol,regs) => {
                    let user = rq.session.user;
                    let text = user.apellido + ' ' + user.nombre + ' PUT: /models/model/tree/autoridades.';
                    let pathg = '';
                        
                        if(bol) pathg = __dirname + '/model.tree.js.logs/success.log';
                        else pathg = __dirname + '/model.tree.js.logs/errors.log';
                        
                        log.set(pathg,text);
                        
                        rs.send({result:bol,rows:regs});
                }
            });
    } else $rs.status(404).send();
});*/

// Super respaldo.
$router.get('/super/respaldo/load',(rq,$rs,n)=>{
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
$router.put('/super/respaldo/restore/:dname',(rq,$rs,n)=>{
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
$router.delete('/super/respaldo/delete/:dname',(rq,$rs,n)=>{
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
$router.get('/super/descargas/load',(rq,$rs,n)=>{
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
$router.get('/super/descargas/download/:dname',(rq,$rs,n)=>{
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
$router.delete('/super/descargas/delete/:dname',(rq,$rs,n)=>{
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
$router.get('/super/logauth/success/load',(rq,$rs,n)=>{
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
$router.get('/super/logauth/errors/load',(rq,$rs,n)=>{
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
$router.get('/super/logtree/success/load',(rq,$rs,n)=>{
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
$router.get('/super/logtree/errors/load',(rq,$rs,n)=>{
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
$router.get('/super/loguser/success/load',(rq,$rs,n)=>{
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
$router.get('/super/loguser/errors/load',(rq,$rs,n)=>{
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