var $fs      = require('fs');
var $path    = require('path');
var viewsApi = {
    //formPassword:ok
    formPassword    : () => {
        let icon = $path.join(__dirname,'/../assets/');
            if(process.platform==='win32')  icon += 'icon.ico';
            if(process.platform==='linux')  icon += 'icon.png';
            if(process.platform==='darwin') icon += 'icon.icns';
        let formPassword = new $window({
            icon        : icon,
            title       : 'Modificar el password',
            parent      : $electron.remote.getCurrentWindow(),
            width       : 400,
            height      : 180,
            modal       : true,
            frame       : true,
            resizable   : false,
            minimizable : false,
            maximizable : false,
            webPreferences : {devTools:false}
        });
        formPassword.loadURL('/view.mdi.files/form.password.html');
        formPassword.setMenu(null);
        formPassword.center();
        formPassword.openDevTools();
    },
    //formLogout:ok
    formLogout      : () => {
        let icon = $path.join(__dirname,'/../assets/');
            if(process.platform==='win32')  icon += 'icon.ico';
            if(process.platform==='linux')  icon += 'icon.png';
            if(process.platform==='darwin') icon += 'icon.icns';
        let formLogout = new $window({
            icon        : icon,
            title       : 'Cerrar sesión',
            parent      : $electron.remote.getCurrentWindow(),
            width       : 400,
            height      : 180,
            modal       : true,
            frame       : true,
            resizable   : false,
            minimizable : false,
            maximizable : false,
            webPreferences : {devTools:false}
        });
        formLogout.loadURL('/view.mdi.files/form.logout.html');
        formLogout.setMenu(null);
        formLogout.center();
        formLogout.openDevTools();
    },
    //formClose:ok
    formClose      : () => {
        let icon = $path.join(__dirname,'/../assets/');
            if(process.platform==='win32')  icon += 'icon.ico';
            if(process.platform==='linux')  icon += 'icon.png';
            if(process.platform==='darwin') icon += 'icon.icns';
        let formClose = new $window({
            icon        : icon,
            title       : 'Salir de la aplicación',
            parent      : $electron.remote.getCurrentWindow(),
            width       : 400,
            height      : 180,
            modal       : true,
            frame       : true,
            resizable   : false,
            minimizable : false,
            maximizable : false,
            webPreferences : {devTools:false}
        });
        formClose.loadURL('/view.mdi.files/form.close.html');
        formClose.setMenu(null);
        formClose.center();
        formClose.openDevTools();
    },
    //formUsuarios:ok
    formUsuarios    : () => {
        let icon = $path.join(__dirname,'/../assets/');
            if(process.platform==='win32')  icon += 'icon.ico';
            if(process.platform==='linux')  icon += 'icon.png';
            if(process.platform==='darwin') icon += 'icon.icns';
        let formUsuarios = new $window({
            icon        : icon,
            title       : 'Administrar Usuarios',
            parent      : $electron.remote.getCurrentWindow(),
            width       : 900,
            height      : 400,
            modal       : true,
            frame       : true,
            resizable   : false,
            minimizable : false,
            maximizable : false,
            webPreferences : {devTools:false}
        });
        formUsuarios.loadURL('/view.mdi.files/form.usuarios.html');
        formUsuarios.setMenu(null);
        formUsuarios.center();
        formUsuarios.openDevTools();    
    },
    formBoletinesOnline : () => {
        let icon = $path.join(__dirname,'/../assets/');
            if(process.platform==='win32')  icon += 'icon.ico';
            if(process.platform==='linux')  icon += 'icon.png';
            if(process.platform==='darwin') icon += 'icon.icns';
        let formBoletines = new $window({
            icon        : icon,
            title       : 'Administrar Boletines Online',
            parent      : $electron.remote.getCurrentWindow(),
            width       : 620,
            height      : 300,
            modal       : true,
            frame       : true,
            resizable   : false,
            minimizable : false,
            maximizable : false,
            webPreferences : {devTools:true}
        });
        formBoletines.loadURL('/view.mdi.files/form.boletines.html');
        formBoletines.setMenu(null);
        formBoletines.center();
        formBoletines.openDevTools();
    },
    formAutoridades : () => {
        let icon = $path.join(__dirname,'/../assets/');
            if(process.platform==='win32')  icon += 'icon.ico';
            if(process.platform==='linux')  icon += 'icon.png';
            if(process.platform==='darwin') icon += 'icon.icns';
        let formAutoridades = new $window({
            icon        : icon,
            title       : 'Administrar Autoridades',
            parent      : $electron.remote.getCurrentWindow(),
            width       : 420,
            height      : 200,
            modal       : true,
            frame       : true,
            resizable   : false,
            minimizable : false,
            maximizable : false,
            webPreferences : {devTools:true}
        });
        formAutoridades.loadURL('/view.mdi.files/form.autoridades.html');
        formAutoridades.setMenu(null);
        formAutoridades.center();
        formAutoridades.openDevTools();
    },

    // Periodos.
    //periodoNuevo:ok
    periodoNuevo    : () => {
        let aceptar = () => {
            window.window('window').progressOn();
            let url  = '/models/model/tree/periodo';
            let header = {'Content-Type':'application/json'};
            let body = new Object();
                body.periodo = form
                    .getItemValue('periodo')
                    .match(/([0-9\°\º\º]{2,4})( periodo legislativo )(\()([0-9]{4})(\))/gi)
                    .join('');
                $ajax
                    .header(header)
                    .body(body)
                    .post(url,(json)=>{
                        if(json.result===true){
                            tree.deleteChildItems(0);
                            tree.load('/models/model/tree/init',null,'json');
                        }
                        else dhtmlx.message({
                            type:'alert-error',
                            title:'ERROR',
                            text:'No se pudo crear el Periodo Legislativo.',
                            ok:'Aceptar'
                        });
                        window.window('window').progressOff();
                        window.window('window').close();
                    });
            };
        let cancelar = ()=>{
                window.window('window').close();
            };
        let window = new dhtmlXWindows();
            window.createWindow('window',0,0,400,180);
            window.window('window').setText('Nuevo Periodo Legislativo');
            window.window('window').setModal(true);
            window.window('window').denyMove();
            window.window('window').denyPark();
            window.window('window').denyResize();
            window.window('window').center();
        let form = window.window('window').attachForm();
            form.loadStruct([
                {name:'periodo', type:'input',label:'Periodo:', labelWidth:70, inputWidth:230, maxLength:31, offsetLeft:5, value:'º PERIODO LEGISLATIVO ()', required:true}
            ]);
            form.enableLiveValidation(true);
            form.attachEvent('onEnter',aceptar);
        let toolbar = window.window('window').attachToolbar();
            toolbar.loadStruct([
                {id:'aceptar',  type:'button', text:'Aceptar',  img:'/icons/accept.png', imgdis:'/icons/accept.png'},    
                {id:'cancelar', type:'button', text:'Cancelar', img:'/icons/cancel.png', imgdis:'/icons/cancel.png'}
            ]);
            toolbar.attachEvent('onClick',(button)=>{
                switch(button){
                    case 'cancelar' : cancelar(); break;
                    case 'aceptar'  : aceptar();  break; 
                }
            });
    },
    //periodoEditar:ok
    periodoEditar   : () => {

        let id     = tree.getSelectedItemId();
        let parent = tree.getParentId(id);

        if(parent===0){
            if(confirm('¿Esta seguro que desea modificar este Periodo?')){
                let url = '/models/model/tree/periodo/' + id;

                let header = new Object();
                    header['Content-Type'] = 'application/json';

                    $ajax
                        .header(header)
                        .get(url,(json) => {
                            if(json.result===true){

                                let aceptar = () => {
                                    window.window('window').progressOn();
                                    let url  = '/models/model/tree/periodo/' + id;
                                    let body = new Object();
                                        body.text = form.getItemValue('periodo');
                                        body.text = body.text.match(/([0-9\°\º\º]{2,4})( periodo legislativo )(\()([0-9]{4})(\))/gi);
                                        body.text = body.text.join('');
                                        $ajax
                                            .header(header)
                                            .body(body)
                                            .put(url,(json)=>{
                                                if(json.result===true){
                                                    tree.deleteChildItems(0);
                                                    tree.load('/models/model/tree/init',null,'json');
                                                }
                                                else dhtmlx.message({
                                                    type:'alert-error',
                                                    title:'ERROR',
                                                    text:'No se pudo modificar el Periodo Legislativo.',
                                                    ok:'Aceptar'
                                                });
                                                window.window('window').progressOff();
                                                window.window('window').close();
                                            });
                                };

                                let cancelar = ()=>{
                                        window.window('window').close();
                                    };

                                let window = new dhtmlXWindows();
                                    window.createWindow('window',0,0,330,120);
                                    window.window('window').setText('Modificar Periodo Legislativo');
                                    window.window('window').setModal(true);
                                    window.window('window').denyMove();
                                    window.window('window').denyPark();
                                    window.window('window').denyResize();
                                    window.window('window').center();

                                let form = window.window('window').attachForm();
                                    form.loadStruct([
                                        {name:'periodo', type:'input',label:'Periodo:', labelWidth:70, inputWidth:230, maxLength:31, offsetLeft:5, value:json.rows.text, required:true}
                                    ]);
                                    form.enableLiveValidation(true);
                                    form.attachEvent('onEnter',);

                                let toolbar = window.window('window').attachToolbar();
                                    toolbar.loadStruct([
                                        {id:'aceptar',  type:'button', text:'Aceptar',  img:'/icons/accept.png', imgdis:'/icons/accept.png'},    
                                        {id:'cancelar', type:'button', text:'Cancelar', img:'/icons/cancel.png', imgdis:'/icons/cancel.png'}
                                    ]);
                                    toolbar.attachEvent('onClick',(button)=>{
                                        if(button==='cancelar') cancelar();
                                        if(button==='aceptar')  aceptar();
                                    });
                            }
                        });
            }
        }
    },
    //periodoEliminar:ok
    periodoEliminar : () => {
        let id = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
        if(parent===0){
            if(confirm('¿Esta seguro que desea eliminar este Periodo Legislativo?')){
                
                let url = '/models/model/tree/periodo/' + id;
                
                let header = new Object();
                    header['Content-Type'] = 'application/json';
                
                    $ajax
                        .header(header)
                        .delete(url,(json) => {

                            if(json.result===true){
                                tree.deleteChildItems(0);
                                tree.load('/models/model/tree/init',null,'json');
                                mdi.cells('c').attachHTMLString('');
                            }

                            else dhtmlx.message({
                                type:'alert-error',
                                title:'ERROR',
                                text:'No se pudo eliminar el Periodo Legislativo.',
                               ok:'Aceptar'
                            });

                        });
            }
        }
    },

    // Boletines.
    //boletinNuevo:ok
    boletinNuevo    : () => { 
        let id = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
        let periodo = tree.getSelectedItemText(id);
        if(parent===0){
            let date = new Date();

            let anio = periodo.match(/([0-9]{4})(\))$/gi);
                anio = anio.join('');
                anio = anio.replace(/\(/gi,'');

            let mes  = date.getMonth() +1;
                if(mes.length==1) mes = '0' + mes;

            let year = date.getFullYear();

            let aceptar = () => {
                    window.window('window').progressOn();

                    let url  = '/models/model/tree/boletin/' + id;

                    let header = new Object();
                        header['Content-Type'] = 'application/json';

                    let body = new Object();
                        body['parent']  = id;
                        body['sesion']  = form.getItemValue('sesion').match(/[a-z0-9]/gi).join('');
                        body['forma']   = form.getItemValue('forma').match(/[A-Z\ ]/gi).join('');
                        body['reunion'] = form.getItemValue('reunion').match(/[0-9]/g).join('');
                        body['fecha']   = form.getCalendar('fecha').getFormatedDate("%Y-%m-%d");
                        body['hora']    = form.getCalendar('hora').getFormatedDate("%h:%i:%s");
                        body['periodo'] = periodo;
                        body['numero']  = form.getItemValue('numero').toString().match(/[0-9]{1,3}/gi).join('');
                        body['anio']    = form.getItemValue('anio').toString().match(/[0-9]{4}/gi).join('');
                        body['desde']   = form.getCalendar('desde').getFormatedDate('%Y-%m-%d');
                        body['hasta']   = form.getCalendar('hasta').getFormatedDate('%Y-%m-%d');
                        body['observ']  = form.getItemValue('observaciones') || ' ';
                        body['observ']  = body['observ'].match(/[A-Z0-9áéíóúÁÉÍÓÚ\,\.\ ]/gi).join('');

                    let file = body.numero + '-' + body.anio;

                    $ajax
                        .header(header)
                        .body(body)
                        .post(url,(json)=>{
                            if(json.result===true){
                                tree.deleteChildItems(0);
                                tree.load('/models/model/tree/init',()=>{
                                    tree.openItem(parent);
                                    tree.selectItem(json.rows);
                                },'json');
                            }
                            else dhtmlx.message({
                                type:'alert-error',
                                title:'ERROR',
                                text:'No se pudo crear el Boletín Legislativo.',
                                ok:'Aceptar'
                            });
                            window.window('window').progressOff();
                            window.window('window').close();
                        });
                };
            let cancelar = ()=>{
                    window.window('window').close();
                };
            let window = new dhtmlXWindows();
                window.createWindow('window',0,0,650,480);
                window.window('window').setText('Nuevo Boletin Legislativo');
                window.window('window').setModal(true);
                window.window('window').denyMove();
                window.window('window').denyPark();
                window.window('window').denyResize();
                window.window('window').center();
            let options1 = [];
            let options2 = [];
                for(let i=1;i<=100;i++){
                    i = i.toString();
                    if(i.length===1) i='0'+i;
                    options1.push({text:i+'º',value:i+'º'});
                    options2.push({text:'Reunión Número ' +i,value:i});
                }
            let form = window.window('window').attachForm();
                form.loadStruct([
                    {type:'block',list:[
                        {type:'label',label:'Datos de la Sesión'},
                        {type:'block',list:[
                            {type:'label',label:'Número de Reunión:'},
                            {type:'newcolumn'},
                            {type:'select',name:'reunion',required:true,options:options2,inputWidth:400,offsetLeft:30}
                        ]},
                        {type:'block',list:[
                            {type:'label',label:'Número de Sesión:'},
                            {type:'newcolumn'},
                            {type:'select',name:'sesion',inputWidth:40,required:true,options:options1,offsetLeft:40},
                            {type:'newcolumn'},
                            {type:'label',label:'Tipo de Sesión:',offsetLeft:110},
                            {type:'newcolumn'},
                            {type:'select',name:'forma',inputWidth:140,options:[
                                {value:'PREPARATORIA',text:'PREPARATORIA'},
                                {value:'ORDINARIA',text:'ORDINARIA'},
                                {value:'EXTRAORDINARIA',text:'EXTRAORDINARIA'},
                                {value:'ESPECIAL',text:'ESPECIAL'}
                            ]}
                        ]},
                        {type:'block',list:[
                            {type:'label',label:'Realizada el :'},
                            {type:'newcolumn'},
                            {type:'calendar', name:'fecha', inputWidth:120, value:anio+'-'+mes+'-01', required:true,offsetLeft:75},
                            {type:'newcolumn'},
                            {type:'label',label:' A las :',offsetLeft:35},
                            {type:'newcolumn'},
                            {type:'calendar', name:'hora', inputWidth:120, value:anio+'-'+mes+'-01', required:true,offsetLeft:80}
                        ]}
                    ]},
                    {type:'block', list:[
                        {type:'label',label:'Datos del Boletín'},
                        {type:'block', list:[
                            {type:'newcolumn'},
                            {type:'label', label:'Numero:'},
                            {type:'newcolumn'},
                            {type:'input', name:'numero', inputWidth:25, maxLength:3, required:true, validate:'ValidNumeric', value:1},
                            {type:'newcolumn'},
                            {type:'label', label:'/'},
                            {type:'newcolumn'},
                            {type:'input', name:'anio', inputWidth:40, maxLength:4, required:true, validate:'ValidNumeric', value:parseInt(anio), readonly:true},
                            {type:'newcolumn'},
                            {type:'label', label:' desde ',offsetLeft:60},
                            {type:'newcolumn'},
                            {type:'calendar', name:'desde', inputWidth:100, value:anio+'-'+mes+'-01', required:true},
                            {type:'newcolumn'},
                            {type:'label', label:' hasta ',offsetLeft:80},
                            {type:'newcolumn'},
                            {type:'calendar', name:'hasta', inputWidth:100, value:anio+'-'+mes+'-05', required:true}
                        ]}
                    ]},
                    {type:'block', list:[
                        {type:'label',  label:'Observaciones:'},
                        {type:'editor', name:'observaciones', inputWidth:550, inputHeight:120,offsetLeft:20}
                    ]}
                ]);
                form.enableLiveValidation(true);
                form.setCalendarDateFormat('fecha','%d/%m/%Y','%Y-%m-%d');
                form.setCalendarDateFormat('hora','%h:%i:%s','%h:%i:%s');
                form.setCalendarDateFormat('desde','%d/%m/%Y','%Y-%m-%d');
                form.setCalendarDateFormat('hasta','%d/%m/%Y','%Y-%m-%d');
                form.setFocusOnFirstActive();
            let hora = form.getCalendar('hora');
                hora.setDateFormat('%h:%i:%s');
                hora.showTime();
                hora.attachEvent('onShow',function(){
                    this.contDates.style.display = 'none';
                    this.contDays.style.display  = 'none';
                    this.contMonth.style.display = 'none';
                });
                hora.attachEvent('onTimeChange',function(){
                    this.i[this._activeInp].input.value=addZero(d.getHours())+":"+addZero(d.getMinutes());
                });
            let toolbar = window.window('window').attachToolbar();
                toolbar.loadStruct([
                    {id:'aceptar',  type:'button', text:'Aceptar',  img:'/icons/accept.png', imgdis:'/icons/accept.png'},    
                    {id:'cancelar', type:'button', text:'Cancelar', img:'/icons/cancel.png', imgdis:'/icons/cancel.png'}
                ]);
                toolbar.attachEvent('onClick',(button)=>{
                    if(button==='aceptar')  aceptar();
                    if(button==='cancelar') cancelar();
                });
        }
    },
    //boletinEditar:
    boletinEditar   : () => {
        let id = tree.getSelectedItemId();
        let text = tree.getSelectedItemText().replace('/','-');
        let parent = tree.getParentId(id);
        if(parent!=0){
            let urlb = '/models/model/tree/boletin/' + text + '/html';
            let urlt = '/models/model/tree/tareas/' + parent + '/' +id;
                mdi.cells('c').attachURL(urlb,false);
                list.clearAll();
                list.load(urlt,'json',()=>{
                    //mdi.cells('b').cell.childNodes.item(1).childNodes.item(0).style.overflowY='scroll';
                });
        }
    },
    //boletinGuardar:ok
    boletinGuardar  : () => {
        let id     = tree.getSelectedItemId();
        let file   = tree.getSelectedItemText().replace('/','-');
        let parent = tree.getParentId(id);
        if(parent!=0){

            let url = '/models/model/tree/boletin/' + file + '/html';
            let iframe = mdi.cells('c').getFrame();
            let idocument = iframe.document || iframe.contentDocument || iframe.contentWindow.document;
            let header = {
                'Content-Type':'text/plain; charset=UTF-8',
                'Content-Generator':'legislatura/diario/boletin'
            };
            let html = idocument;
                html = html.documentElement.innerHTML;
                html = "<html>\n" + html + "</html>\n";
                html = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//ES\" \"http://www.w3.org/TR/html4/strict.dtd\">\n" + html;
                html = window.btoa(html);

                $ajax
                    .header(header)
                    .body(html)
                    .put(url,(json)=>{
                        if(json.result===true)  dhtmlx.message({text:'El Boletín Legislativo se guardó en forma correcta.'});
                        if(json.result===false) dhtmlx.message({text:'No se pudo guardar los cambios en el Boletín Legislativo',type:'error'});
                    });

        }
    },
    //boletinEliminar:ok
    boletinEliminar : () => {

        let boletinid   = tree.getSelectedItemId();
        let boletinfile = tree.getSelectedItemText().replace('/','-');
        let periodoid   = tree.getParentId(boletinid);

        if(periodoid!=0){
            if(confirm('¿Esta seguro que desea eliminar este Boletín Legislativo?')){

                let url = '/models/model/tree/boletin/' + periodoid + '/' + boletinid + '/' + boletinfile;

                let header = new Object();
                    header['Content-Type'] = 'application/json';

                    mdi.progressOn()

                    $ajax
                        .header(header)
                        .delete(url,(json) => {

                            if(json.result===true){
                                tree.deleteChildItems('0');
                                tree.load('/models/model/tree/init',() => {
                                    tree.openItem(periodoid);
                                    mdi.cells('c').attachHTMLString('');
                                    list.clearAll();
                                },'json');
                            }

                            else dhtmlx.message({
                                type:'alert-error',
                                title:'ERROR',
                                text:'No se pudo eliminar el Boletín Legislativo.',
                                ok:'Aceptar'
                            });

                            mdi.progressOff();

                        });

            }
        }
        
    },
    //boletinBloquear:ok
    boletinBloquear : () => {
        let id = tree.getSelectedItemId()
        let parent = tree.getParentId(id);
        let file = tree.getSelectedItemText(id).replace('/','-');
            if(parent!=0 && confirm('¿Esta seguro que desea bloquear este boletín?')===true){

                let url = '/models/model/tree/boletin/' + file +'/bloquear';
                $ajax
                    .put(url,(json)=>{
                        if(json.result===true) dhtmlx.message({
                                type:'alert-warning',
                                title:'OK',
                                text:'El Boletín se bloqueo con éxito.',
                                ok:'Aceptar',
                                callback:()=>{ $exe.boletinEditar(); }
                            });
                        else dhtmlx.message({
                            type:'alert-error',
                            title:'ERROR',
                            text:'No se pudo bloquear el boletín.',
                            ok:'Aceptar'
                        });
                    });

            }
    },
    //boletinDesbloquear:ok
    boletinDesbloquear : () => {

        let id = tree.getSelectedItemId()

        let parent = tree.getParentId(id);

            if(parent!=0 && confirm('¿Esta seguro que desea desbloquear este boletín?')===true){

                let file = tree.getSelectedItemText(id).replace('/','-');

                let url = '/models/model/tree/boletin/' + file +'/desbloquear';

                    $ajax.put(url,(json)=>{

                        if(json.result===true) dhtmlx.message({
                                type:'alert-warning',
                                title:'OK',
                                text:'El Boletín se desbloqueo con éxito.',
                                ok:'Aceptar',
                                callback:()=>{ $exe.boletinEditar(); }
                            });

                        else dhtmlx.message({
                            type:'alert-error',
                            title:'ERROR',
                            text:'No se pudo desbloquear el boletín.',
                            ok:'Aceptar'
                        });

                    });

            }
    },

    // Herramientas.
    //rowAdd:ok
    rowAdd : (id) => {

        let tr = document.createElement('tr');
            tr.valign = 'middle';
            tr.bgColor = '#FFFFFF';

        let font0 = document.createElement('font');
            font0.color = '#000000';
            font0.face = 'Arial, Helvetica, Sans-Serif';
            font0.size = 2;
            font0.style.fontWeight = 'bold';
            font0.style.textTransform = 'uppercase';
            font0.innerHTML = '&nbsp;';
        let td0 = document.createElement('td');
            td0.align = 'center';
            td0.contentEditable = true;
            td0.appendChild(font0);
            tr.appendChild(td0);

        let font1 = document.createElement('font');
            font1.color = '#000000';
            font1.face = 'Arial, Helvetica, Sans-Serif';
            font1.size = 2;
            font1.style.fontWeight = 'bold';
            font1.style.textTransform = 'uppercase';
            font1.innerHTML = '&nbsp;';
        let td1 = document.createElement('td');
            td1.align = 'center';
            td1.contentEditable = true;
            td1.appendChild(font1);
            tr.appendChild(td1);

        let font2 = document.createElement('font');
            font2.color = '#000000';
            font2.face = 'Arial, Helvetica, Sans-Serif';
            font2.size = 2;
            font2.innerHTML = '&nbsp;';
        let td2 = document.createElement('td');
            td2.align = 'justify';
            td2.contentEditable = true;
            td2.appendChild(font2);
            tr.appendChild(td2);

        let font3 = document.createElement('font');
            font3.color = '#000000';
            font3.face = 'Arial, Helvetica, Sans-Serif';
            font3.size = 2;
            font3.innerHTML = '&nbsp;';
        let td3 = document.createElement('td');
            td3.style.textTransform = 'capitalize';
            td3.contentEditable = true;
            td3.appendChild(font3);
            tr.appendChild(td3);

        let font4 = document.createElement('font');
            font4.color = '#000000';
            font4.face = 'Arial, Helvetica, Sans-Serif';
            font4.size = 2;
            font4.innerHTML = '&nbsp;';
        let td4 = document.createElement('td');
            td4.align = 'justify';
            td4.contentEditable = true;
            td4.appendChild(font4);
            tr.appendChild(td4);
        
        let iframe = mdi.cells('c').getFrame();
        let idocument = iframe.document || iframe.contentDocument || iframe.contentWindow.document;
        let table = idocument.getElementById(id);            
            table.appendChild(tr);
            if(table.hidden==true) table.hidden=false;
    },
    //rowDelete:ok
    rowDelete : () => {
        let id     = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
        if(parent!=0){
            let iframe = mdi.cells('c').getFrame();
            let idocument = iframe.document || iframe.contentDocument || iframe.contentWindow.document;
            let nodeSelected = idocument.getSelection();
            let findTableInNode = function(node){
                    if(node.nodeName=='TR') node.remove();
                    else findTableInNode(node.parentNode);
                };
                findTableInNode(nodeSelected.focusNode);
        }
    },
    //rowInsert:ok
    rowInsert : () => {
        let id     = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
        if(parent!=0) {
            let tr = document.createElement('tr');
                tr.valign = 'middle';
                tr.bgColor = '#FFFFFF';

            let font0 = document.createElement('font');
                font0.color = '#000000';
                font0.face = 'Arial, Helvetica, Sans-Serif';
                font0.size = 2;
                font0.style.fontWeight = 'bold';
                font0.style.textTransform = 'uppercase';
                font0.innerHTML = '&nbsp;';
            let td0 = document.createElement('td');
                td0.align = 'center';
                td0.contentEditable = true;
                td0.appendChild(font0);
                tr.appendChild(td0);

            let font1 = document.createElement('font');
                font1.color = '#000000';
                font1.face = 'Arial, Helvetica, Sans-Serif';
                font1.size = 2;
                font1.style.fontWeight = 'bold';
                font1.style.textTransform = 'uppercase';
                font1.innerHTML = '&nbsp;';
            let td1 = document.createElement('td');
                td1.align = 'center';
                td1.contentEditable = true;
                td1.appendChild(font1);
                tr.appendChild(td1);

            let font2 = document.createElement('font');
                font2.color = '#000000';
                font2.face = 'Arial, Helvetica, Sans-Serif';
                font2.size = 2;
                font2.innerHTML = '&nbsp;';
            let td2 = document.createElement('td');
                td2.align = 'justify';
                td2.contentEditable = true;
                td2.appendChild(font2);
                tr.appendChild(td2);

            let font3 = document.createElement('font');
                font3.color = '#000000';
                font3.face = 'Arial, Helvetica, Sans-Serif';
                font3.size = 2;
                font3.innerHTML = '&nbsp;';
            let td3 = document.createElement('td');
                td3.style.textTransform = 'capitalize';
                td3.contentEditable = true;
                td3.appendChild(font3);
                tr.appendChild(td3);

            let font4 = document.createElement('font');
                font4.color = '#000000';
                font4.face = 'Arial, Helvetica, Sans-Serif';
                font4.size = 2;
                font4.innerHTML = '&nbsp;';
            let td4 = document.createElement('td');
                td4.align = 'justify';
                td4.contentEditable = true;
                td4.appendChild(font4);
                tr.appendChild(td4);

            let iframe = mdi.cells('c').getFrame();
            let idocument = iframe.document || iframe.contentDocument || iframe.contentWindow.document;
            let nodeSelected = idocument.getSelection();
            let findTableInNode = function(node){
                    if(node.nodeName=='TABLE') node.appendChild(tr);
                    else findTableInNode(node.parentNode);
                };
                findTableInNode(nodeSelected.focusNode);
        }
    },
    //buscarProyecto:ok
    buscarProyecto : () => {
        let id = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
        if(parent!=0) mdi.cells('d').expand();
    },
    //leyNuevoAMano:ok
    leyNuevoAMano : () => {
        let id     = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
        if(parent!=0) viewsApi.rowAdd('leyes');
    },
    //resolucionNuevoAMano:ok
    resolucionNuevoAMano : () => { 
        let id     = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
        if(parent!=0) viewsApi.rowAdd('resoluciones');
    },
    //declaracionNuevoAMano:pk
    declaracionNuevoAMano : () => { 
        let id     = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
        if(parent!=0) viewsApi.rowAdd('declaraciones');
    },

    // Tareas.
    //tareaNueva:ok
    tareaNueva : () => {

        let id = tree.getSelectedItemId();
        let parent = tree.getParentId(id);

        if(parent!=0){

            let window = new dhtmlXWindows();
                window.createWindow('window',0,0,430,300);
                window.window('window').setText('Nueva Tarea');
                window.window('window').setModal(true);
                window.window('window').denyMove();
                window.window('window').denyPark();
                window.window('window').denyResize();
                window.window('window').center();

            let form = window.window('window').attachForm([
                {type:'block',list:[
                    {type:'label',label:'Tarea:'},
                    {type:'input',name:'titulo',inputWidth:380,required:true},
                    {type:'label',label:'Descripción:'},
                    {type:'editor',name:'tarea',inputWidth:380,inputHeight:80,required:true}
                ]}
            ]);
            form.enableLiveValidation(true);
            form.setFocusOnFirstActive();

            let formEventAceptar = () => {
                if(form.validate()===true){
                    
                    window.window('window').progressOn();
                    
                    let url  = '/models/model/tree/tarea/' + parent + '/' + id;
                    
                    let header = {'Content-Type':'application/json'};

                    let body = new Object();
                        body.titulo = form.getItemValue('titulo');
                        body.titulo = body.titulo.match(/[0-9a-zàèìòùÀÈÌÒÙñÑ\.\,\;\ ]/gi)
                        body.titulo = body.titulo.join('');
                        body.tarea = form.getItemValue('tarea');
                        body.tarea = body.tarea.match(/[0-9a-záéíóúÁÉÍÓÚñÑ\<\>\=\"\'\.\,\;\ ]/gi);
                        body.tarea = body.tarea.join(''),

                        $ajax
                            .header(header)
                            .body(body)
                            .post(url,(json)=>{

                                if(json.result===true){
                                    dhtmlx.message({text:'La tarea fue agregada a este Boletín.'});
                                    list.add(body);
                                }

                                else dhtmlx.message({
                                    type:'alert-error',
                                    title:'ERROR',
                                    text:'No se pudo crear la Tarea.',
                                    ok:'Aceptar'
                                });

                                window.window('window').progressOff();
                                window.window('window').close();

                            });

                }
            };

            let toolbar = window.window('window').attachToolbar();
            toolbar.loadStruct([
                {id:'aceptar',  type:'button', text:'Aceptar',  img:'/icons/accept.png', imgdis:'/icons/accept.png'},    
                {id:'cancelar', type:'button', text:'Cancelar', img:'/icons/cancel.png', imgdis:'/icons/cancel.png'}
            ]);
            toolbar.attachEvent('onClick',(button)=>{
                switch(button){
                    case 'cancelar' : window.window('window').close(); break;
                    case 'aceptar'  : formEventAceptar();              break; 
                }
            });
                
        }
    },
    //tareaModificar:ok
    tareaModificar : () => {
        let id = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
            if(parent!=0){
                if(confirm('¿Esta seguro que desea modificar esta Tarea?')){

                    let idt = list.getSelected();
                    let tarea = list.get(idt);
                    let window = new dhtmlXWindows();
                        window.createWindow('window',0,0,430,300);
                        window.window('window').setText('Modificar Tarea');
                        window.window('window').setModal(true);
                        window.window('window').denyMove();
                        window.window('window').denyPark();
                        window.window('window').denyResize();
                        window.window('window').center();
        
                    let form = window.window('window').attachForm([
                            {type:'block',list:[
                                {type:'label',label:'Tarea:'},
                                {type:'input',name:'titulo',inputWidth:380,required:true,value:tarea.titulo},
                                {type:'label',label:'Descripción:'},
                                {type:'editor',name:'tarea',inputWidth:380,inputHeight:80,required:true,value:tarea.tarea}
                            ]}
                        ]);
                        form.enableLiveValidation(true);
                        form.setFocusOnFirstActive();
        
                    let formEventAceptar = () => {
                        if(form.validate()===true){
                            window.window('window').progressOn();

                            let header = {'Content-Type':'application/json'};

                            let body = new Object();
                                body.titulo = form.getItemValue('titulo')
                                body.titulo = body.titulo.match(/[0-9a-zàèìòùÀÈÌÒÙñÑ\.\,\;\ ]/gi);
                                body.titulo = body.titulo.join('');
                                body.tarea  = form.getItemValue('tarea');
                                body.tarea  = body.tarea.match(/[0-9a-záéíóúÁÉÍÓÚñÑ\<\>\=\"\'\.\,\;\ ]/gi);
                                body.tarea  = body.tarea.join('');
                                body.index  = list.indexById(idt);

                            let url  = '/models/model/tree/tarea/' + parent + '/' + id;

                                $ajax
                                    .header(header)
                                    .body(body)
                                    .put(url,(json)=>{

                                        if(json.result===true){
                                            let url = '/models/model/tree/tareas/' + parent + '/' + id;
                                                list.clearAll();
                                                list.load(url,'json');
                                                dhtmlx.message({text:'La Tarea se modificó en forma correcta.'});
                                        }

                                        else dhtmlx.message({
                                            type:'alert-error',
                                            title:'ERROR',
                                            text:'No se pudo modificar la Tarea.',
                                            ok:'Aceptar'
                                        });
                                    
                                        window.window('window').progressOff();
                                        window.window('window').close();

                                    });

                        }

                    };
                    let toolbar = window.window('window').attachToolbar();
                        toolbar.loadStruct([
                            {id:'aceptar',  type:'button', text:'Aceptar',  img:'/icons/accept.png', imgdis:'/icons/accept.png'},    
                            {id:'cancelar', type:'button', text:'Cancelar', img:'/icons/cancel.png', imgdis:'/icons/cancel.png'}
                        ]);
                        toolbar.attachEvent('onClick',(button)=>{
                            switch(button){
                                case 'cancelar' : window.window('window').close(); break;
                                case 'aceptar'  : formEventAceptar();              break; 
                            }
                        });                
                }
            }
    },
    // tareaEliminar:ok
    tareaEliminar : () => {
        let id = tree.getSelectedItemId();
        let parent = tree.getParentId(id);
        if(parent!=0){
            if(confirm('¿Esta seguro que desea eliminar esta Tarea?')){
                let idt = list.getSelected();

                let index = list.indexById(idt);

                let header = {'Content-Type':'application/json'};

                let url = '/models/model/tree/tarea/' + parent + '/' + id + '/' + index;

                    $ajax
                        .header(header)
                        .delete(url,(json) => {

                            if(json.result===true){
                                let url = '/models/model/tree/tareas/' + parent + '/' + id;
                                    list.clearAll();
                                    list.load(url,'json');
                                    dhtmlx.message({text:'La Tarea se eliminó en forma correcta.'});
                            }
                            
                            else dhtmlx.message({
                                type:'alert-error',
                                title:'ERROR',
                                text:'No se pudo eliminar la Tarea.',
                                ok:'Aceptar'
                            });

                    });
            }
        }
    },

    // Exportar.
    //exportarAWORD:ok
    exportarAWORD : () => {
        let id = tree.getSelectedItemId();
        let name = tree.getSelectedItemText().replace('/','-');
        let parent = tree.getParentId(id);

        if(parent!=0){

            mdi.progressOn();

            let url = '/models/model/tree/exportar/word/' + name;

            let header = {'Content-Type':'application/json'};

                $ajax
                    .header(header)
                    .post(url,(json)=>{

                        if(json.result===true){
                            let a = document.createElement('A');
                                a.href = url;
                                a.click();
                                mdi.progressOff();
                        }
                        
                        else dhtmlx.message({text:'No se pudo exportar el Boletín en WORD.',tipe:'error'});
                    });
        }
    },
    exportarAWEB : () => {
        let id = tree.getSelectedItemId();
        let name = tree.getSelectedItemText().replace('/','-');
        let parent = tree.getParentId(id);
        let indexp = tree.getIndexById(parent);
        let indexb = tree.getIndexById(id);
        if(parent!=0){
            mdi.progressOn();
            let url = 'models/model/tree/exportar/pdf/' + name;
                dhx.ajax().post(url,null,(json)=>{
                    json = JSON.parse(json);
                    if(json.result===true){
                        let xhr = dhx.ajax().post('models/model/tree/exportar/web/' + indexp + '.' + indexb + '.' + name);
                            xhr.onload = xhr => {
                                mdi.progressOff();
                                json = JSON.parse(xhr.target.responseText);
                                if(json.result===true) dhtmlx.message({text:'El Boletín Legislativo se publico en forma correcta.',type:'success'});
                                else dhtmlx.message({text:'No se pudo publicar el Boletín Legislativo.',type:'error'});
                                $exe.formBoletinesOnline();
                            };
                        }
                });
        }
    },
    exportarAPDF : () => {
        let id = tree.getSelectedItemId();
        let name = tree.getSelectedItemText().replace('/','-');
        let parent = tree.getParentId(id);
        if(parent!=0){

            let header = {'Content-Type':'application/json'};
            let url = '/models/model/tree/exportar/pdf/' + name;

                mdi.progressOn();

                $ajax
                    .header(header)
                    .post(url,(json)=>{
                        
                        if(json.result===true){

                            let a = document.createElement('A');
                                a.href = url;
                                a.click();

                        } else dhtmlx.message({text:'No se pudo exportar el Boletín en PDF.',type:'error'});

                        mdi.progressOff();
                    });
        }
    }
    
};
module.exports = viewsApi;