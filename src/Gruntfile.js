/**
 * Grunt, The Javascript Task Runner
 */


// npm-installed modules
import load from "load-grunt-tasks";


export default function(grunt) {
  load(grunt);

  grunt.initConfig({
    eslint: {
      src: ["src/**/*.js"],
    },
    mochaTest: {
      test: {
        options: {
          reporter: "spec",
          quiet: false,
          clearRequireCache: false,
        },
        src: ["test/**/test.*.js"],
      },
    },
  });

  grunt.registerTask("test", ["eslint", "mochaTest"]);
}
