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

    // targets
    lint: ['grunt.js', 'webinos/**/*.js'],
    concat: {
      dist: {
        src: [
          'webinos/core/wrt/lib/webinos.util.js',
          'webinos/core/rpc/lib/registry.js',
          'webinos/core/rpc/lib/rpc.js',
          'webinos/core/manager/messaging/lib/messagehandler.js',
          'webinos/core/wrt/lib/webinos.session.js',
          'webinos/core/wrt/lib/webinos.servicedisco.js',
          'webinos/core/wrt/lib/webinos.js',
          'webinos/core/api/file/lib/virtual-path.js',
          'webinos/core/wrt/lib/webinos.file.js',
          'webinos/core/wrt/lib/webinos.webnotification.js',
          'webinos/core/wrt/lib/webinos.actuator.js',
          'webinos/core/wrt/lib/webinos.tv.js',
          'webinos/core/wrt/lib/webinos.oauth.js',
          'webinos/core/wrt/lib/webinos.get42.js',
          'webinos/core/wrt/lib/webinos.geolocation.js',
          'webinos/core/wrt/lib/webinos.sensors.js',
          'webinos/core/wrt/lib/webinos.events.js',
          'webinos/core/wrt/lib/webinos.applauncher.js',
          'webinos/core/wrt/lib/webinos.vehicle.js',
          'webinos/core/wrt/lib/webinos.deviceorientation.js',
          'webinos/core/wrt/lib/webinos.context.js',
          'webinos/core/wrt/lib/webinos.authentication.js',
          'webinos/core/wrt/lib/webinos.contacts.js',
          'webinos/core/wrt/lib/webinos.devicestatus.js',
          'webinos/core/wrt/lib/webinos.discovery.js',
          'webinos/core/wrt/lib/webinos.payment.js'
        ],
        dest: '<config:generated.normal>'
      }
    },
    uglify: {
      mangle: {
        toplevel: false
      }
    },
    min: {
      dist: {
        src: ['<config:generated.normal>'],
        dest: '<config:generated.min>'
      }
    },
    clean: ['<config:generated.normal>', '<config:generated.min>']
  });

  // plugin provides "clean" task
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('clean-certs', 'Cleans certificates from user dir', function() {
    var winPath = ['AppData', 'Roaming', 'webinos'];
    var unixPath = ['.webinos'];

    var webinosRelPath = os.platform() === 'win32' ? winPath : unixPath;
    var relPath = ['..'].concat(webinosRelPath);
    // the path to .webinos/ dir
    var webinosConfPath = grunt.file.userDir.apply(null, relPath);

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
      return grunt.file.userDir.apply(null, relPath.concat([p]));
    });
    webinosConfSubdirs = webinosConfSubdirs.filter(function(p) {
      return p ? true : false;
    });
    if (!webinosConfSubdirs.length) {
      grunt.log.writeln('There are no certificates to remove.');
      return;
    }

    var oldClean = grunt.config.get('clean');
    grunt.config.set('clean', webinosConfSubdirs);

    // finally call clean task to remove all subdirs from .webinos with certs
    var done = this.async();
	grunt.task.run('clean');
	done();

    grunt.config.set('clean', oldClean);
  });

  grunt.registerTask('minify', 'concat min');

  grunt.registerTask('default', 'concat');
};
