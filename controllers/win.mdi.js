var $fs       = require('fs');
var $path     = require('path');
var $electron = require('electron');
var $window   = $electron.BrowserWindow;
var $event    = $electron.ipcMain;
var $mode     = $path.join(__dirname,'/../conf/mode.json');
    $mode     = $fs.readFileSync($mode,{encoding:'utf8'});
    $mode     = JSON.parse($mode);
var $config   = $mode.config.server;
var $host     = $config.proto + '://' + $config.ip + ':' + $config.port + '/';

var winMdi           = new Object();
    winMdi.window    = null;
    winMdi.winLogin  = null;
    winMdi.functions = new Object();
    winMdi.create    = (json,view,winLogin) => {

        let icon = $path.join (__dirname,'/../assets/');
            if(process.platform==='win32')  icon += 'icon.ico';
            if(process.platform==='linux')  icon += 'icon.png';
            if(process.platform==='darwin') icon += 'icon.icns';

            view = $host + '/view.mdi.' + view + '.html?user=';
            view = view + JSON.stringify(json);

            winMdi.winLogin = winLogin;

            winMdi.window = new $window({
                width       : winLogin.workAreaSize.width,
                height      : winLogin.workAreaSize.height,
                center      : true,
                resizable   : true,
                movable     : true,
                minimizable : true,
                maximizable : true,
                allwaysOnTop: false,
                title       : 'Dirección Diario de Sesiones',
                icon        : icon,
                frame       : true,
                modal       : false,
                contextIsolation : true,
                allowRunningInsecureContent : false,
                webPreferences : {
                    nodeIntegration : true,
                    sandbox : false,
                    devTools : true
                }
            });
            winMdi.window.loadURL(view);
            winMdi.window.setMenu(null);
            winMdi.window.maximize();
            winMdi.window.openDevTools();

            winMdi.window.on('close',()=>{
                let app = $electron.app;
                    app.quit();
            });
    };
    winMdi.destroy = () => {
        winMdi.window.destroy();  
    };
    
    // Eventos.
    $event.on('form-password-application-quit',(event)=>{
        let app = $electron.app;
            app.quit();
    });
    $event.on('form-logout-application-logout',(event)=>{
        let winLogin = winMdi.winLogin;
            winLogin.create();
            winMdi.destroy();
    });
    $event.on('form-logout-application-exit',(event)=>{
        let app = $electron.app;
            app.quit();
    });
    module.exports = winMdi;