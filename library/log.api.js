var $fs = require('fs');
var $path = require('path');
var logApi = new Object();
    logApi.logName = null;
    logApi.logSuccessPath = null;
    logApi.logErrorsPath = null;
    logApi.to = (logName)=>{
        logName = logName.match(/[a-z0-9\_\-\/]/gi);
        logName = logName.join('');
        logName = 'model.' + logName + '.js.logs';
        let logSuccessPath = $path.join(__dirname,'/../models/',logName) + '/success.log';
        let logErrorsPath = $path.join(__dirname,'/../models/',logName) + '/errors.log';
            if($fs.existsSync(logSuccessPath)===true && $fs.existsSync(logErrorsPath)===true){
                logApi.logName = logName;
                logApi.logSuccessPath = logSuccessPath;
                logApi.logErrorsPath = logErrorsPath;
                return logApi;
            } else console.log('logApiError: El log no existe en el repositorio.');

    };
    logApi.write = (logContent,logType)=>{
        let D = new Date();

        let month = '0' + (D.getMonth() +1)
        let day   = '0' + D.getDate();
        let hour  = '0' + D.getHours();
        let min   = '0' + D.getMinutes();
        let sec   = '0' + D.getSeconds();

        if(month.length>=3) month = month.substr(1,2);
        if(day.length>=3)   day   = day.substr(1,2);
        if(hour.length>=3)  hour  = hour.substr(1,2);
        if(min.length>=3)   min   = min.substr(1,2);
        if(sec.length>=3)   sec   = sec.substr(1,2);

        let date = '[';
            date += D.getFullYear();
            date += '-';
            date += month;
            date += '-';
            date += day;
            date += ' ';
            date += hour;
            date += ':';
            date += min;
            date += ':';
            date += sec;
            date += '] ';

            logContent = logContent.match(/[a-z0-9áéíóúÁÉÍÓÚñÑ\ \.\,\;\/]/gi);
            logContent = logContent.join('');
            logContent = date + logContent;

            if(logType==='success'){
                $fs.readFile(logApi.logSuccessPath,{encoding:'utf8'},(error,data)=>{
                    if(error===null){
                        logArray = JSON.parse(data);
                        logArray.unshift(logContent);

                        if(logArray.length>=3001) logArray.pop();

                        logArray = JSON.stringify(logArray);

                        $fs.writeFile(logApi.logSuccessPath,logArray,{ecoding:'utf8'},()=>{});
                    }
                })
            }

            if(logType==='error'){
                $fs.readFile(logApi.logErrorsPath,{encoding:'utf8'},(error,data)=>{
                    if(error===null){
                        logArray = JSON.parse(data);
                        logArray.unshift(logContent);

                        if(logArray.length>=3001) logArray.pop();

                        logArray = JSON.stringify(logArray);

                        $fs.writeFile(logApi.logErrorsPath,logArray,{ecoding:'utf8'},()=>{});
                    }
                })
            }

    };
    module.exports = logApi;