var $db   = require('../library/model.api');
var $log     = require('../library/log.api');
var $express = require('express');
var $router  = $express.Router();

$router.all('/',(rq,rs,n)=>{ rs.sendStatus(404); });

$router.post('/login',(rq,rs,n)=>{

    let where = new Object();
        where.usuario = rq.body.user.match(/[0-9a-z]{4,10}/gi).join('');
        where.password = rq.body.pass.match(/[0-9a-z]{32}/gi).join('');

    let callback = (result,rows)=>{
            if(result===true){
                rq.session.regenerate(()=>{

                    rq.session.cookie.expires = new Date(Date.now() + 3600000);
                    rq.session.cookie.maxAge = 3600000;
                    rq.session.status = true;
                    rq.session.user = rows[0];

                    delete rows[0].password;

                    $log
                        .to('auth')
                        .write(rq.session.user.nombre + ' ' + rq.session.user.apellido + ' ingreso al sistema.','success');
                    rs
                        .type('json')
                        .set({'Content-Type':'application/json'})
                        .send({result:true,rows:rows})
                        .end();

                });
            }
            
            else {
                $log
                    .to('auth')
                    .write(where.usuario + ' ' + where.password + ' intentó ingresar al sistema.','error');
                rs
                    .sendStatus(404)
                    .end();
            }
        };

        $db
            .select('ONE')
            .from('usuarios')
            .where(where)
            .done(callback);
});

$router.delete('/logout',(rq,rs,n)=>{

    if(rq.session.status===true){
        let user = rq.session.user;
            rq.session.destroy();
            $log
                .to('auth')
                .write(user.nombre + ' ' + user.apellido + ' ha cerrado su sesion en forma correcta.','success');
            rs
                .type('json')
                .set({'Content-Type':'applicatgion/json'})
                .send({result:true,rows:null})
                .end();
    }

    else {
        $log
            .to('auth')
            .write('Se ha reiniciado la session en forma automatica.','success');
        rq.session = null;
        rs.sendStatus(404).end();
    }

});

$router.put('/password',(rq,rs,n)=>{
    if(rq.session.status===true){

        let log =  rq.session.user.nombre + ' ' + rq.session.user.apellido;
            log += ' PUT /password';

        let set = new Object();
            set.password = rq.body.newpass;
            set.password = set.password.match(/[0-9a-z]{32}/gi).join('');

        let where = rq.session.user;

        let callback = (result,rows)=>{

                if(result===true){
                    $log
                        .to('auth')
                        .write(log,'success');
                    rs
                        .type('json')
                        .set({'Content-Type':'application/json'})
                        .send({result:true,rows:null})
                        .end();
                }
                else {
                    $log
                        .to('auth')
                        .write(log,'errors');
                    rs
                        .sendStatus(404)
                        .end();
                }
            };

            $db
                .update('usuarios')
                .set(set)
                .where(where)
                .done(callback);
    } else rs.sendStatus(404).end();
});

module.exports = $router;