var $fs      = require('fs');
var $cmd     = require('child_process');
var $zip     = require('zip-dir');
var $path    = require('path');
var $https   = require('https');
var $express = require('express');
var $session = require('express-session');
var $parser  = require('body-parser');

var $config   = $path.join(__dirname,'/conf/server.json');
    $config   = $fs.readFileSync($config,'utf8');
    $config   = JSON.parse($config);

var $ssl = new Object();
    $ssl.key  = $path.join(__dirname,'/ssl/ssl.key');
    $ssl.key  = $fs.readFileSync($ssl.key,'utf8');
    $ssl.cert = $path.join(__dirname,'/ssl/ssl.crt');
    $ssl.cert = $fs.readFileSync($ssl.cert,'utf8');

// Modelos.
var modelAuth     = require('./models/model.auth');
var modelUsuarios = require('./models/model.usuarios');
var modelTree     = require('./models/model.tree');

// Server.
var $server = $express();
    $server.use($session({secret:'keyboard cat', resave:false, saveUninitialized:true, cookie:{secure:false,maxAge:3600000}}));
    $server.use((rq,rs,n)=>{
        let generator = rq.headers['content-generator'] || '';
        let type = rq.headers['content-type'] || '';
            if(generator==='legislatura/diario/boletin' && type==='text/plain; charset=UTF-8'){
                let rawBody = ''; 
                    rq.on('data',(p)=>rawBody+=p);
                    rq.on('end',()=>{
                        rq.rawBody = rawBody;
                        n();
                    });
            } else n();
    });
    $server.use($parser.json({limit:'100mb',extended:true}));
    $server.use($parser.urlencoded({limit:'100mb',extended:true}));
    $server.use($express.static($path.join(__dirname + '/library/dhtmlx/imgs/dhxtree_material')));
    $server.use($express.static($path.join(__dirname + '/views')));
    $server.use('/models/model/auth',modelAuth);
    $server.use('/models/model/usuarios',modelUsuarios);
    $server.use('/models/model/tree',modelTree);
    $server.use('/models/model',(rq,rs,a)=>{rs.sendStatus(404).end();});
    $server.use('/models',(rq,rs,a)=>{rs.sendStatus(404).end();});
    $server.use('/',(rq,rs,a)=>{rs.sendStatus(404).end();});

    $listen = $https.createServer($ssl,$server);
    $listen.listen($config.port,()=>{
    //$server.listen($config.port,()=>{
        
        console.log('Servidor inicializado en: ' + $config.port);

        let date  = new Date;
        let month = '0' + (date.getMonth() +1);
        let day   = '0' + date.getDate();
        let hours = '0' + date.getHours();
        let min   = '0' + date.getMinutes();
        let sec   = '0' + date.getSeconds();

            if(month.length>=3)  month = month.substr(1,2);
            if(day.length>=3)    day   = day.substr(1,2);
            if(hours.length>=3)  hours = hours.substr(1,2);
            if(min.length>=3)    min   = min.substr(1,2);
            if(sec.length>=3)    sec   = sec.substr(1,2);

        let dname  = date.getFullYear() + month + day + '_' + hours + min + sec;

        let zipBackFiles  = (dname)=>{
            let zname = dname  + '.zip';
                zname = $path.join(__dirname,'/database/backupzip/',zname);
                $zip(zname,{saveTo:zname },()=>{});
            };
        
        let copyBackFiles = (dname)=>{
            let bname = $path.join(__dirname,'/database/backup/',dname);
            let files = $path.join(__dirname,'/database');
                $fs.copyFile($path.join(files,'/autoridades.db'),$path.join(bname,'/autoridades.db'),(e)=>{
                    if(e===null) $fs.copyFile($path.join(files,'/boletin.db'),$path.join(bname,'/boletin.db'),(e)=>{
                        if(e===null) $fs.copyFile($path.join(files,'/usuarios.db'),$path.join(bname,'/usuarios.db'),(e)=>{

                            if(e===null) zipBackFiles(dname);
                            
                        });
                    });
                });
            };
        
            if($fs.existsSync($path.join(__dirname,'/database/backup/',dname))===true) copyBackFiles(dname);
            else {
                $fs.mkdir($path.join(__dirname,'/database/backup/',dname),(e)=>{
                    if(e===null) $fs.chmod(dname,0755,()=>{
                        copyBackFiles(dname);
                    });
                });
            }

    });