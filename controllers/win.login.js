var $fs       = require('fs');
var $path     = require('path');
var $electron = require('electron');
var winMdi    = require('./win.mdi');
var $window   = $electron.BrowserWindow;
var $event    = $electron.ipcMain;
var $mode     = $path.join(__dirname,'/../conf/mode.json');
    $mode     = $fs.readFileSync($mode,{encoding:'utf8'});
    $mode     = JSON.parse($mode);
var $config   = $mode.config.server;
var $host     = $config.proto + '://' + $config.ip + ':' + $config.port + '/';


var winLogin  = new Object();
    winLogin.window = null;
    winLogin.workAreaSize   = null;
    winLogin.create = ()=>{

        winLogin.workAreaSize = $electron.screen.getPrimaryDisplay().workAreaSize;

        let icon = $path.join (__dirname,'/../assets/');
            if(process.platform==='win32')  icon += 'icon.ico';
            if(process.platform==='linux')  icon += 'icon.png';
            if(process.platform==='darwin') icon += 'icon.icns';

        let view = $host + 'view.login.html';
            winLogin.window = new $window({
                width       : 400,
                height      : 160,
                center      : true,
                resizable   : false,
                movable     : false,
                minimizable : false,
                maximizable : false,
                allwaysOnTop: true,
                title       : 'Dirección Diario de Sesiones',
                icon        : icon,
                frame       : true,
                modal       : true,
                nodeIntegration  : false,
                contextIsolation : true,
                allowRunningInsecureContent : true,
                webPreferences : {
                    webSecurity:false,
                    allowDisplayingInsecureContent:false,
                    allowRunningInsecureContent:true,
                    devTools:true
                }
            });
            winLogin.window.loadURL(view);
            winLogin.window.setMenu(null);
            winLogin.window.center();
            winLogin.window.openDevTools();

    };
    winLogin.destroy = ()=>{
        winLogin.window.destroy();
    };

    // Eventos.
    $event.on('win-login-create-mdi-super',(event,json)=>{
        delete json.password;
        winMdi.create(json,'super',winLogin);
        winLogin.destroy();
    });
    $event.on('win-login-create-mdi-admin',(event,json)=>{
        delete json.password;
        winMdi.create(json,'admin',winLogin);
        winLogin.destroy();
    });
    $event.on('win-login-create-mdi-user',(event,json)=>{
        delete json.password;
        winMdi.create(json,'user',winLogin);
        winLogin.destroy();
    });

    module.exports = winLogin;