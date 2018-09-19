var $fs    = require('fs');
var $path  = require('path');

var modelApi = new Object();
    modelApi.tableSTMT   = 'SELECT';
    modelApi.tableName   = null;
    modelApi.tablePath   = null;
    modelApi.tableSet    = null;
    modelApi.tableWhere  = null;
    modelApi.tableValues = null;
    modelApi.tableSelectSchema = null;
    modelApi.tableOrder  = null;

    modelApi.select = (schema)=>{
        modelApi.tableSTMT = 'SELECT';
        if(schema===null) console.log('modelApiError: el método select require el parámetro esquema.');
        else {
            schema = schema.match(/([ONE]{3})|([SET]{3})|(({)([a-z0-9:"',]+)(}))|((\[)([a-z0-9"',]+)(\]))/gi);
            schema = schema.join('');
            modelApi.tableSelectSchema = schema;
            return modelApi;
        }
    };
    modelApi.update = (table)=>{
        modelApi.tableSTMT = 'UPDATE';
        return modelApi.from(table);
    };
    modelApi.insert = ()=>{
        modelApi.tableSTMT = 'INSERT';
        return modelApi;
    };
    modelApi.delete = ()=>{
        modelApi.tableSTMT = 'DELETE';
        return modelApi;
    };
    modelApi.into = (table)=>{
        return modelApi.from(table);
    };
    modelApi.from = (tableName)=>{
        if(modelApi.tableSelectSchema===null) console.log('modelApiError: Primero debe especificar el método select.');
        else {
            tableName = tableName.match(/[0-9a-z\_\-]/gi);
            tableName = tableName.join('');
            tableName = tableName + '.db';
            tablePath = $path.join(__dirname,'/../database/',tableName);
            if($fs.existsSync(tablePath)){
                modelApi.tableName = tableName;
                modelApi.tablePath = tablePath;
                return modelApi;
            } else console.log('modelApiError: El model no existe en el repositorio.');
        }
    };
    modelApi.set = (set)=>{
        if(typeof(set)==='object'){
            set = JSON.stringify(set);
            set = set.match(/[a-z0-9áéíóúÁÉÍÓÚñÑ\°\º\º\:\"\.\,\{\}\[\]\(\)\/\ ]/gi);
            set = set.join('');
            set = JSON.parse(set);
        }
        modelApi.tableSet = set;
        return modelApi;
    };
    modelApi.values = (values)=>{
        if(typeof(values)==='object'){
            values = JSON.stringify(values);
            values = values.match(/[a-z0-9áéíóúÁÉÍÓÚñÑ\°\º\º\:\"\.\,\{\}\[\]\(\)\/\ ]/gi);
            values = values.join('');
            values = JSON.parse(values);
        } else values = null;
        modelApi.tableValues = values;
        return modelApi;
    };
    modelApi.where = (where)=>{
        if(where===null) modelApi.tableWhere = null;
        else{
            if(typeof where==='object'){
                where = JSON.stringify(where);
                where = where.match(/(({)([a-z0-9\:\"\'\,\/\ ]+)(}))/gi);
                where = where.join('');
                where = JSON.parse(where);
                modelApi.tableWhere = where;
            }
        }
        return modelApi;
    };
    modelApi.orderBy = (order) => {
        if(order===null) modelApi.tableOrder = null;
        else{
            if(typeof order==='object'){
                order = JSON.stringify(order);
                order = order.match(/(({)([a-z0-9\:\"\'\,\[\]\ ]+)(}))/gi);
                order = order.join('');
                order = JSON.parse(order);
                modelApi.tableOrder = order;
            }
        }
        return modelApi;
    };
    modelApi.done = (callback)=>{
        if(modelApi.tableName===null) console.log('modelApiError: Primero debe ejecutar el método from, update o into.');
        else {
            $fs.readFile(modelApi.tablePath,{encoding:'utf8'},(error,data)=>{
                if(error===null){
                    let $table = JSON.parse(data);
                        if(modelApi.tableSTMT==='SELECT') $table = modelApi.functions.processSelect($table,callback);
                        if(modelApi.tableSTMT==='UPDATE') $table = modelApi.functions.processUpdate($table,callback);
                        if(modelApi.tableSTMT==='INSERT') $table = modelApi.functions.processInsert($table,callback);
                        if(modelApi.tableSTMT==='DELETE') $table = modelApi.functions.processDelete($table,callback);
                } else callback(false,null);
            });
        }
    };
    modelApi.functions = new Object();
    modelApi.functions.getKeys = ($object)=>{
        let keys = new Array();
            for(k in $object) keys.push(k);
            return keys;
    };
    modelApi.functions.processSelect = ($table,$callback)=>{

        let $schema = modelApi.tableSelectSchema;

            if(modelApi.tableWhere!=null) {
                let $return = new Array();
                let $keys   = modelApi.functions.getKeys(modelApi.tableWhere);
                let $where  = modelApi.tableWhere;
                    for(i in $table){
                        $eval = new Array();
                        for(k in $keys) $eval.push('$table[' + i + '].'+ $keys[k] + '===$where.' + $keys[k]);
                        $eval = $eval.join(' && ');
                        $eval = eval($eval);
                        if($eval===true) $return.push($table[i]);
                    }
                    $table = $return;
            }

            if(modelApi.tableOrder!=null){
                let $keys  = modelApi.functions.getKeys(modelApi.tableOrder);
                let $order = modelApi.tableOrder;

                    for($k in $keys){
                        let $field  = $keys[$k];
                        let $direct = $order[$keys[$k]][0];
                        let $type   = $order[$keys[$k]][1];

                        let $tmp = new Array();
                            for($i in $table) $tmp.push({name:$table[$i][$field],key:$i});
                            $tmp.sort((a,b)=>{
                                let A = null;
                                let B = null;
                                if($type==='string'){
                                    A = a.name.toUpperCase();
                                    B = b.name.toUpperCase();
                                }
                                if($type==='date'){
                                    A = new Date(a.name);
                                    B = new Date(b.name);
                                }
                                if($type==='number'){
                                    A = a.name;
                                    A = A.match(/[0-9]/gi);
                                    A = A.join('');
                                    A = parseInt(A);
                                    B = b.name;
                                    B = B.match(/[0-9]/gi);
                                    B = B.join('');
                                    B = parseInt(B);
                                }
                                if(A<B) return -1;
                                if(A>B) return 1;
                                return 0;
                            });

                            if($direct==='DESC') $tmp.reverse();

                        let $return = new Array();
                            for($i in $tmp) $return.push($table[$tmp[$i].key]);

                            $table = $return;

                    }
            }

            if($table.length>=1){
                if($schema==='ONE') $callback(true,[$table[0]]);
                if($schema==='SET') $callback(true,$table);
                //if(typeof $schema ==='object') ;
                //if(typeof $schema ==='array') ;
            } else $callback(false,null);

    };
    modelApi.functions.processUpdate = ($table,$callback)=>{
        let $keyS  = modelApi.functions.getKeys(modelApi.tableSet);
        let $keyW  = modelApi.functions.getKeys(modelApi.tableWhere);
        let $done  = false;
        let $set   = modelApi.tableSet;
        let $where = modelApi.tableWhere;
            for(let i in $table){
                let $eval = new Array();
                    for(let k in $keyW) $eval.push('$table[' + i +'].' + $keyW[k] + '===$where.' + $keyW[k]);
                    $eval = $eval.join(' && ');
                    $eval = eval($eval);
                    if($eval===true){
                        for(e in $keyS) $table[i][$keyS[e]] = $set[$keyS[e]];
                        $done = true;
                    }
            }

            $table = JSON.stringify($table);

            if($done===true){
                $fs.writeFile(modelApi.tablePath,$table,{encoding:'utf8'},(error)=>{
                    if(error===null) $callback(true,null);
                    else $callback(false,null);
                });
            } else $callback(false,null);

    };
    modelApi.functions.processInsert = ($table,$callback)=>{
        $table.push(modelApi.tableValues);
        $table = JSON.stringify($table);
        $fs.writeFile(modelApi.tablePath,$table,'utf8',(error)=>{
            if(error===null) $callback(true,null);
            else $callback(false,null);
        });
    };
    modelApi.functions.processDelete = ($table,$callback)=>{
        let $return = new Array();
        let $where  = modelApi.tableWhere;
        let $keys   = modelApi.functions.getKeys($where);

            for(i in $table){
                let $eval = new Array();
                    for(k in $keys) $eval.push('$table[' + i + '].' + $keys[k] + '===$where.' + $keys[k]);
                    $eval = $eval.join(' && ');
                    $eval = eval($eval);
                    if($eval===false) $return.push($table[i]);
            }

            $table = JSON.stringify($return);

            $fs.writeFile(modelApi.tablePath,$table,{encoding:'utf8'},(error)=>{
                if(error===null) $callback(true,null);
                else $callback(false,null);
            })
    };

    module.exports = modelApi;