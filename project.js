var $fs         = require('fs');
var $zip        = require('zip-dir');
var $path       = require('path');
var $express    = require('express');
var $session    = require('express-session');
var $electron   = require('electron');
var $event      = $electron.ipcMain;
var $bodyParser = require('body-parser');
var $mode       = $path.join(__dirname,'/conf/mode.json');
    $mode       = $fs.readFileSync($mode,{encoding:'utf8'});
    $mode       = JSON.parse($mode);
var $httpPort   = $mode.build.server.baseHref.match(/[0-9]{2,4}\/$/gi).join('').replace('/','');

// Controladores.
var winLogin   = require('./controllers/win.login');

/* APPLICATION; ExpressJS.*/
let applicationExpress = $express();

/* APPLICATION; ElectronsJS.*/
var applicationElectron = $electron.app;
    applicationElectron.on('window-all-closed',applicationElectron.quit);
    applicationElectron.on('ready',()=>{

        applicationElectron.commandLine.appendSwitch('ignore-certificate-errors', true);
          
        if($mode.mode==='server'){

            // Modelos.
            var modelAuth     = require('./models/model.auth');
            var modelUsuarios = require('./models/model.usuarios');
            var modelTree     = require('./models/model.tree');

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
                    $zip(zname, {saveTo:zname },(e,b)=>{
                        if(e===null){
                            applicationExpress.use($session({secret:'keyboard cat', resave:false, saveUninitialized:true, cookie:{secure:false,maxAge:3600000}}));
                            applicationExpress.use((rq,rs,n)=>{
                                let generator = rq.headers['content-generator'];
                                let type      = rq.headers['content-type'];
                                    if(generator==='legislatura/diario/boletin' && type==='text/plain; charset=UTF-8'){
                                        let rawBody = ''; 
                                            rq.on('data',(p)=>rawBody+=p);
                                            rq.on('end',()=>{
                                                rq.rawBody = rawBody;
                                                n();
                                            });
                                    } else n();
                            });
                            applicationExpress.use($bodyParser.json({limit:'100mb',extended:true,inflate:true}));
                            applicationExpress.use($bodyParser.urlencoded({limit:'100mb',extended:true,inflate:true}));
                            applicationExpress.use($express.static($path.join(__dirname + '/library/dhtmlx/imgs/dhxtree_material')));
                            applicationExpress.use($express.static($path.join(__dirname + '/views')));
                            applicationExpress.use('/models/model/auth',     modelAuth);
                            applicationExpress.use('/models/model/usuarios', modelUsuarios);
                            applicationExpress.use('/models/model/tree',     modelTree);
                            applicationExpress.use('/models/model',          (rq,rs,a)=>{rs.status(404).send();});
                            applicationExpress.use('/models',                (rq,rs,a)=>{rs.status(404).send();});
                            applicationExpress.use('/',                      (rq,rs,a)=>{rs.status(404).send();});
                            applicationExpress.listen($httpPort,()=>{
                                winLogin.create();
                            });
                        }
                    });
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
        } else winLogin.create();

    });