var ajax = new Object();
    ajax.mode           = 'object';
    ajax.schema         = new Object();
    ajax.schema.method  = 'GET';
    ajax.schema.params  = null;
    ajax.schema.url     = null;
    ajax.schema.headers = null;
    ajax.schema.body    = null;

    ajax.request = ()=>{

        let $ajax   = null;
        let XMLHttp = null;
            if(ajax.mode==='object') XMLHttp = window.XMLHttpRequest;
            if(ajax.mode==='module') XMLHttp = require("xmlhttprequest").XMLHttpRequest;
            $ajax = new XMLHttp();
        
        $ajax.open(ajax.schema.method,ajax.schema.url);
        $ajax.withCredentials = true;

        if(ajax.schema.headers!=null){
            for(key in ajax.schema.headers){
                $ajax.setRequestHeader(key,ajax.schema.headers[key]);
            }
        }
        
        $ajax.onreadystatechange = ()=>{
            if($ajax.readyState===4 && $ajax.status===200){
                let header = $ajax.getResponseHeader('Content-Type');
                let response = null;
                    if(header.indexOf('json')>=1) response = JSON.parse($ajax.responseText);
                    else response = $ajax.responseText;
                    ajax.schema.callback(response);                
            }
        };

        if(ajax.schema.method==='POST'||ajax.schema.method==='PUT'){
           if(ajax.schema.body) $ajax.send(ajax.schema.body,false);
            else $ajax.send(null,false);
        } else $ajax.send(null,false);

    };
    ajax.header = (headers)=>{
        if(typeof(headers)==='object') ajax.schema.headers=headers;
        return ajax;
    };
    ajax.body = (body)=>{
        if(typeof(body)==='object') ajax.schema.body=JSON.stringify(body);
        if(typeof(body)==='string') ajax.schema.body=body;
        return ajax;
    };
    ajax.params  = (params)=>{
        $params = new Array();
        if(typeof params==='object'){
            for(k in params) $params.push(x+'='+params[k]);
            $params = $params.join('&');
            $params = encodeURI($params);
            ajax.schema.params = $params;
        }
        return ajax;
    };
    ajax.get = (url,callback)=>{
        if(ajax.schema.params===null) ajax.schema.url = encodeURI(url);
        else{
            ajax.schema.url = encodeURI(url);
            ajax.schema.url += '?';
            ajax.schema.url += ajax.schema;
        }
        ajax.schema.method = 'GET';
        ajax.schema.callback = callback;
        ajax.request();
    };
    ajax.post = (url,callback)=>{
        if(ajax.schema.params===null) ajax.schema.url = encodeURI(url);
        else{
            ajax.schema.url = encodeURI(url);
            ajax.schema.url += '?';
            ajax.schema.url += ajax.schema;
        }
        ajax.schema.method = 'POST';
        ajax.schema.callback = callback;
        ajax.request();
    };
    ajax.put = (url,callback)=>{
        if(ajax.schema.params===null) ajax.schema.url = encodeURI(url);
        else{
            ajax.schema.url = encodeURI(url);
            ajax.schema.url += '?';
            ajax.schema.url += ajax.schema;
        }
        ajax.schema.method = 'PUT';
        ajax.schema.callback = callback;
        ajax.request();
    };
    ajax.delete = (url,callback)=>{
        if(ajax.schema.params===null) ajax.schema.url = encodeURI(url);
        else{
            ajax.schema.url = encodeURI(url);
            ajax.schema.url += '?';
            ajax.schema.url += ajax.schema;
        }
        ajax.schema.method = 'DELETE';
        ajax.schema.callback = callback;
        ajax.request();
    };
    ajax.setMode = (mode)=>{
        if(mode) ajax.mode = mode;
        else ajax.mode = 'object';
        return ajax;
    };
    module.exports = ajax;