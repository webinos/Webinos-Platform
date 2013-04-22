/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 webinos
 ******************************************************************************/

module.exports = function(grunt) {
  var fs = require('fs');
  var os = require('os');
  var path = require('path');

  grunt.initConfig({
    // config props
    generated: {
      normal: 'webinos/web_root/webinos.js',
      min: 'webinos/web_root/webinos.min.js'
    },
    // dir names to exclude from "clean-certs" target
    excludepaths: ['auth_api', 'context_manager', 'logs', 'wrt'],
    header: "if(typeof webinos === 'undefined'){\n",
    footer: "}",

    // targets
    concat: {
      options: {
        banner: '<%= header %>',
        footer: '<%= footer %>'
      },
      dist: {
        src: [
          'webinos/core/wrt/lib/webinos.util.js',
          'node_modules/webinos-jsonrpc2/lib/registry.js',
          'node_modules/webinos-jsonrpc2/lib/rpc.js',
          'webinos/core/manager/messaging/lib/messagehandler.js',
          'webinos/core/wrt/lib/webinos.session.js',
          'webinos/core/wrt/lib/webinos.service.js',
          'webinos/core/wrt/lib/webinos.js',
          'webinos/core/api/file/lib/virtual-path.js',
          'webinos/core/wrt/lib/webinos.file.js',
          'webinos/core/wrt/lib/webinos.webnotification.js',
          'webinos/core/wrt/lib/webinos.zonenotification.js',
          'webinos/core/wrt/lib/webinos.actuator.js',
          'webinos/core/wrt/lib/webinos.tv.js',
          'webinos/core/wrt/lib/webinos.oauth.js',
          'webinos/core/wrt/lib/webinos.get42.js',
          'webinos/core/wrt/lib/webinos.geolocation.js',
          'webinos/core/wrt/lib/webinos.sensors.js',
          'webinos/core/wrt/lib/webinos.events.js',
          'webinos/core/wrt/lib/webinos.app2app.js',
          'webinos/core/wrt/lib/webinos.appstatesync.js',
          'webinos/core/wrt/lib/webinos.applauncher.js',
          'webinos/core/wrt/lib/webinos.vehicle.js',
          'webinos/core/wrt/lib/webinos.deviceorientation.js',
          'webinos/core/wrt/lib/webinos.context.js',
          'webinos/core/wrt/lib/webinos.authentication.js',
          'webinos/core/wrt/lib/webinos.contacts.js',
          'webinos/core/wrt/lib/webinos.devicestatus.js',
          'webinos/core/wrt/lib/webinos.discovery.js',
          'webinos/core/wrt/lib/webinos.payment.js',
          'webinos/core/wrt/lib/webinos.payment2.js',
          'webinos/core/wrt/lib/webinos.mediacontent.js',
          'webinos/core/wrt/lib/webinos.corePZinformation.js',
          'webinos/core/wrt/lib/webinos.nfc.js',
          'webinos/core/wrt/lib/webinos.servicedisco.js'
        ],
        dest: '<%= generated.normal %>'
      }
    },
    uglify: {
      options: {
        mangle: {
          toplevel: false
        }
      },
      dist: {
        src: '<%= generated.normal %>',
        dest: '<%= generated.min %>'
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'webinos/**/*.js']
    },
    clean: ['<%= generated.normal %>', '<%= generated.min %>']
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask(
    'check-rpc',
    'Check if webinos-jsonrpc2 is in local node_modules, required for concat task',
    function() {
      var isInstalled = (fs.existsSync || path.existsSync)('./node_modules/webinos-jsonrpc2/');
      if (!isInstalled) {
        console.log();
        console.log('\nError: webinos-jsonrpc2 must be in local node_modules.\n');
        console.log();
        return false;
      }
    });

  grunt.registerTask('clean-certs', 'Cleans certificates from user dir', function() {
    var userDir = function () {
      var dirpath = path.join.apply(path, arguments);
      var homepath = process.env[os.platform() === 'win32' ? 'USERPROFILE' : 'HOME'];
      dirpath = path.resolve(homepath, '.grunt', dirpath);
      return grunt.file.exists(dirpath) ? dirpath : null;
    };

    var winPath = ['AppData', 'Roaming', 'webinos'];
    var unixPath = ['.webinos'];

    var webinosRelPath = os.platform() === 'win32' ? winPath : unixPath;
    var relPath = ['..'].concat(webinosRelPath);
    // the path to .webinos/ dir
    var webinosConfPath = userDir.apply(null, relPath);

    // get subdirs from .webinos/
    var webinosConfSubdirs = fs.readdirSync(webinosConfPath);
    // exclude certain subdirs that are not to be deleted
    var paths = grunt.config.get('excludepaths');
    webinosConfSubdirs = webinosConfSubdirs.filter(function(subdir) {
      for (var i=0; i < paths.length; i++) {
        if (subdir === paths[i]) return false;
      }
      return true;
    });

    // build full path for the subdirs
    webinosConfSubdirs = webinosConfSubdirs.map(function(p) {
      return userDir.apply(null, relPath.concat([p]));
    });
    var dirsToRemove = webinosConfSubdirs.filter(function(p) {
      return p ? true : false;
    });

    // add webinosPzh dir if it exists
    var webinosPzhConfPath = path.join(path.dirname(webinosConfPath), os.platform() === 'win32' ? 'webinosPzh' : '.webinosPzh');
    if (fs.existsSync(webinosPzhConfPath)) {
      dirsToRemove.push(webinosPzhConfPath);
    }

    if (!dirsToRemove.length) {
      grunt.log.writeln('There are no certificates to remove.');
      return;
    }

    dirsToRemove.forEach(function(p) {
      grunt.log.write('Deleting ' + p + ' ...');
      var r = grunt.file.delete(p, {force: true});
      if (r) {
        grunt.log.ok();
      } else {
        grunt.log.error();
      }
    });
  });
 grunt.registerTask(
   'webinos-version',
   'inserts webinos version in webinos-config.json file',
   function() {
     var isPresent = (fs.existsSync || path.existsSync)('./webinos_config.json');
     if (!isPresent) {
       grunt.log.writeln('Error: webinos-config.json is missing');
       return false;
     } else {
       var webinos_config = require("./webinos_config.json");
       var done = this.async();
       require("child_process").exec("git describe", function(err, stderr){
         if (!err){
           var webinos_version = stderr && stderr.split("-");
           if(webinos_version) {
             webinos_config.webinos_version.tag = webinos_version[0];
             webinos_config.webinos_version.num_commit = webinos_version[1];
             webinos_config.webinos_version.commit_id = webinos_version[2].replace(/\n/g,"");
             fs.writeFileSync("./webinos_config.json", JSON.stringify(webinos_config, null , " "));
             grunt.log.writeln("webinos_config updated with the correct version");
             var packageValues = require("./package.json");
             if (packageValues && webinos_config.webinos_version.tag > packageValues.version) {
               packageValues.version = webinos_config.webinos_version.tag;
               fs.writeFileSync("./package.json", JSON.stringify(packageValues, null, " "));
               grunt.log.writeln("package.json updated with the correct version, please commit package.json");
             }
           }
           done(true);
         } else {
           grunt.log.writeln("failed to update webinos_config with webinos version");
           done(true);
         }
        });
    }
  });

  grunt.registerTask('default', ['check-rpc', 'concat', 'webinos-version']);
  grunt.registerTask('minify', ['default', 'uglify']);
};
