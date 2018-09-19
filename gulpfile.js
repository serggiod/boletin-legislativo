var $fs     = require('fs');
var $arg    = require('arg'); 
var $args   = $arg({
    '--gulpfile' : String,
    '--mode'     : String,
    '--schema'   : String,
    '--ip'       : String,
    '--port'     : Number
});
var $path   = require('path');
var gulp    = require('gulp');
var replace = require('gulp-replace');
var exec    = require('gulp-exec');


    gulp.task('clean-dir-tmp',(done)=>{
        
        gulp
            .src('./')
            .pipe(exec('rm -r ./tmp/*'));
        done();
    });

    gulp.task('build-in-tmp',(done)=>{
        let path = $path.join(__dirname,'/conf/mode.json');

        let mode = $fs.readFileSync(path,{encoding:'utf-8'});
            mode = JSON.parse(mode);
            mode.mode = $args['--mode'];

        let $argse  = "Los siguientes parametros son oblicagorios:\n\r";
            $argse += "  --mode  : String que define el modo de la aplicación ej: server/client.\n\r";

        let baseh = null;
            if(mode.mode==='server') baseh = mode.build.server.baseHref;
            if(mode.mode==='client') baseh = mode.build.client.baseHref;
            
        if ( $args['--mode'] === undefined) console.log($argse);
        else {
            gulp
                .src('./')
                .pipe(exec('mkdir ./tmp/' + mode.mode,{continueOnError:true}))
                .pipe(exec('mkdir ./tmp/' + mode.mode + '/assets',{continueOnError:true}))
                .pipe(exec('cp -r ./assets/icon.icns ./tmp/' + mode.mode + '/assets'))
                .pipe(exec('cp -r ./assets/icon.png ./tmp/' + mode.mode + '/assets'))
                .pipe(exec('cp -r ./assets/icon.ico ./tmp/' + mode.mode + '/assets'))
                .pipe(exec('cp -r ./conf ./tmp/' + mode.mode))
                .pipe(exec('cp -r ./controllers ./tmp/' + mode.mode))
                .pipe(exec('cp -r ./database ./tmp/' + mode.mode))
                .pipe(exec('cp -r ./imgs ./tmp/' + mode.mode))
                .pipe(exec('cp -r ./models ./tmp/' + mode.mode))
                .pipe(exec('cp -r ./gulpfile.js ./tmp/' + mode.mode))
                .pipe(exec('cp -r ./package.json ./tmp/' + mode.mode))
                .pipe(exec('cp -r ./project.js ./tmp/' + mode.mode))
                .pipe(exec('cp -r ./bower_components ./tmp/' + mode.mode,(e)=>{

                    gulp
                        .src('./')
                        .pipe(exec('cp -r ./node_modules ./tmp/' + mode.mode,(e)=>{

                            gulp
                                .src('./views/*.*')
                                .pipe(replace('http://localhost:8888/',baseh))
                                .pipe(gulp.dest('./tmp/' + mode.mode + '/views/'));

                            gulp
                                .src('./views/view.mdi.files/*.html')
                                .pipe(replace('http://localhost:8888/',baseh))
                                .pipe(gulp.dest('./tmp/' + mode.mode + '/views/view.mdi.files/'));

                            gulp
                                .src('./')
                                .pipe(exec('rm -r ./tmp/' + mode.mode + '/database/backup/*',{continueOnError:true}))
                                .pipe(exec('rm -r ./tmp/' + mode.mode + '/database/backupzip/*.*',{continueOnError:true}))
                                .pipe(exec('rm -r ./tmp/' + mode.mode + '/models/model.tree.js.files/html/*.*',{continueOnError:true}))
                                .pipe(exec('rm -r ./tmp/' + mode.mode + '/models/model.tree.js.files/pdf/*.*',{continueOnError:true}))
                                .pipe(exec('rm -r ./tmp/' + mode.mode + '/models/model.tree.js.files/word/*.*',{continueOnError:true}))
                                .pipe(exec('cp ./confF/mysql.json ./tmp/' + mode.mode + '/conf/'))
                                .pipe(exec('cp ./confF/ssh.json ./tmp/' + mode.mode + '/conf/'))
                                .pipe(exec('cp ./confF/autoridades.db ./tmp/' + mode.mode + '/database/'))
                                .pipe(exec('cp ./confF/boletin.db ./tmp/' + mode.mode + '/database/'))
                                .pipe(exec('cp ./confF/usuarios.db ./tmp/' + mode.mode + '/database/'))
                                .pipe(exec('cp ./confF/success.log ./tmp/' + mode.mode + '/models/model.auth.js.logs/'))
                                .pipe(exec('cp ./confF/errors.log ./tmp/' + mode.mode + '/models/model.auth.js.logs/'))
                                .pipe(exec('cp ./confF/success.log ./tmp/' + mode.mode + '/models/model.tree.js.logs/'))
                                .pipe(exec('cp ./confF/errors.log ./tmp/' + mode.mode + '/models/model.tree.js.logs/'))
                                .pipe(exec('cp ./confF/success.log ./tmp/' + mode.mode + '/models/model.usuario.js.logs/'))
                                .pipe(exec('cp ./confF/errors.log ./tmp/' + mode.mode + '/models/model.usuario.js.logs/',(e)=>{

                                    if(mode.mode==='client') {
                                        gulp
                                            .src('./')
                                            .pipe(exec('rm -r ./tmp/' + mode.mode + '/database'))
                                            .pipe(exec('rm -r ./tmp/' + mode.mode + '/models'));
                                    }
                                    let $package = $fs.readFileSync('./tmp/' + mode.mode + '/package.json',{encoding:'utf-8'});
                                        $package = JSON.parse($package);
                                        $package.name = mode.mode;
                                        $package.productName = mode.mode;
                                        $package = JSON.stringify($package);
                    
                                        $fs.writeFileSync('./tmp/' + mode.mode + '/package.json',$package,{encoding:'utf-8'});
                                        $fs.writeFileSync('./tmp/' + mode.mode + '/conf/mode.json',JSON.stringify(mode),{encoding:'utf-8'});

                                        done();
                    
                                }));
                        }));

                }));
        }

    });

    gulp.task('rebuild',(done)=>{
        let $ = $path.sep;
        let path  = $path.join(__dirname,$,'conf',$,'mode.json');
        let mode  = $fs.readFileSync(path,{encoding:'utf-8'});
            mode  = JSON.parse(mode);
        let basen = mode.build[mode.mode].baseHref;
        let baseo = $fs.readFileSync(__dirname,$,'views',$,'view.login.html',{encoding:'utf-8'});
            baseo = baseo.match(/<base\ href(.*)>$/gmi).join('');
            baseo = baseo.match(/http(.*)\//gi).join('');

            gulp
                .src(__dirname,$,'views',$,'*.*')
                .pipe(replace(baseo,basen))
                .pipe(gulp.dest(__dirname,$,'views',$));

            gulp
                .src(__dirname,$,'views',$,'view.mdi.files',$,'*.html')
                .pipe(replace(baseo,basen))
                .pipe(gulp.dest(__dirname,$,'views',$,'view.mdi.files',$));

            done();
    });
    