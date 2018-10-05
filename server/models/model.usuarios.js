var $db      = require('../library/model.api');
var $log     = require('../library/log.api');
var $unique  = require('uniqid');
var $express = require('express');
var $router  = $express.Router();

$router.all('/',(rq,rs,n)=>{
    rs.sendStatus(404).end();
});

$router.get('/select',(rq,rs,n)=>{

    let callback = (result,usuarios)=>{
            
            let log = rq.session.user.nombre + ' ' + rq.session.user.apellido;
                log += ' GET: /models/model/usuarios/select.';

                if(result===true){

                    let rows = new Array();
                        for(let i in usuarios) {
                            rows[i] = {
                                id: i.toString(),
                                data:[
                                    usuarios[i].id,
                                    usuarios[i].nombre,
                                    usuarios[i].apellido,
                                    usuarios[i].usuario,
                                    usuarios[i].tipo,
                                    usuarios[i].password
                                ]
                            }
                        }

                    $log
                        .to('auth')
                        .write(log,'success');

                    rs
                        .type('json')
                        .set({'Content-Type':'application/json'})
                        .send({result:true,rows:rows})
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
        .select('SET')
        .from('usuarios')
        .where(null)
        .done(callback);

});

$router.post('/insert',(rq,rs,n)=>{

    let log = rq.session.user.nombre + ' ' + rq.session.user.apellido;
        log += ' POST: /models/model/usuarios/insert.'

    let values = new Object();
        values['id']       = $unique();
        values['nombre']   = rq.body.nombre.match(/[A-Z0-9 ]{2,30}/gi).join('');
        values['apellido'] = rq.body.apellido.match(/[A-Z0-9 ]{2,30}/gi).join('');
        values['usuario']  = rq.body.usuario.match(/[A-Z0-9]{6,10}/gi).join('');
        values['password'] = rq.body.password.match(/[A-Z0-9]{6,10}/gi).join('');
        values['tipo']     = rq.body.tipo.match(/[A-Z0-9 ]{2,30}/gi).join('');

        $db
            .insert()
            .into('usuarios')
            .values(values)
            .done((result,rows)=>{
                
                if(result===true){
                    $log
                        .to('usuarios')
                        .write(log,'success');
                    rs
                        .type('json')
                        .set({'Content-Type':'application/json'})
                        .send({result:true,rows:null})
                        .end();
                }

                else{
                    $log
                        .to('usuarios')
                        .write(log,'errors');
                    rs
                        .sendStatus(404)
                        .end();
                }
            });

});

$router.put('/update/:id',(rq,rs,n)=>{
    let id = rq.params.id;
        id = id.match(/[a-z0-9]/gi);
        id = id.join('');

    let log = rq.session.user.nombre + ' ' +rq.session.user.apellido;
        log += ' PUT: /models/model/usuarios/update/' + id + '.';

    let set = new Object();
        set['nombre']   = rq.body.nombre.match(/[A-Z0-9\ ]{2,30}/gi).join('');
        set['apellido'] = rq.body.apellido.match(/[A-Z0-9\ ]{2,30}/gi).join('');
        set['usuario']  = rq.body.usuario.match(/[A-Z0-9]{4,10}/gi).join('');
        set['tipo']     = rq.body.tipo.match(/[A-Z0-9\ ]{2,32}/gi).join('');
        if(rq.body.password) set['password'] = rq.body.password.match(/[A-Z0-9]{4,32}/gi).join('');

    let where = new Object();
        where['id'] = id;

        $db
            .update('usuarios')
            .set(set)
            .where(where)
            .done((result,rows)=>{

                if(result===true){
                    $log
                        .to('usuarios')
                        .write(log,'success');

                    rs
                        .type('json')
                        .set({'Content-Type':'application/json'})
                        .send({result:true,rows:null})
                        .end();

                }

                else{
                    $log
                        .to('usuarios')
                        .write(log,'erros');
                    
                    rs
                        .sendStatus(404)
                        .end();
                }

            })

});

$router.delete('/delete/:id',(rq,rs,n)=>{
    let id = rq.params.id;
        id = id.match(/[a-z0-9]/gi);
        id = id.join('');

    let log = rq.session.user.nombre + ' ' +rq.session.user.apellido;
        log += ' DELETE: /models/model/usuarios/delete/' + id + '.';

    let where = new Object();
        where['id'] = id;

        $db
            .delete()
            .from('usuarios')
            .where(where)
            .done((result,rows)=>{
                if(result===true){
                    $log
                        .to('usuarios')
                        .write(log,'success');
                    rs
                        .type('json')
                        .set({'Content-Type':'application/json'})
                        .send({result:true,rows:null})
                        .end();
                }
                else {
                    $log
                        .to('usuarios')
                        .write(log,'errors');
                    rs
                        .sendStatus(404)
                        .end();
                }

            });
});

module.exports = $router;