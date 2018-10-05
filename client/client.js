var $electron = require('electron');
var $winlogin   = require('./controllers/win.login');

let $client = $electron.app;

    $client.on('window-all-closed',$client.quit);
    $client.on('ready',()=>{

        $client.commandLine.appendSwitch('ignore-certificate-errors', true);
        $winlogin.create();

    });