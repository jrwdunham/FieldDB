#!/bin/bash
CURRENTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

cd angular_client/modules/corpuspages &&
# rm -rf node_modules
# rm -rf bower_components

npm install || exit 1;
bower install || exit 1;

echo "Using local fielddb commonjs";
rm bower_components/fielddb/fielddb.js;
# rm bower_components/fielddb/fielddb.min.js;
ln -s $CURRENTDIR/fielddb.js $CURRENTDIR/angular_client/modules/core/bower_components/fielddb/fielddb.js;
# ln -s $CURRENTDIR/fielddb.min.js $CURRENTDIR/angular_client/modules/core/bower_components/fielddb/fielddb.min.js;
ls -al $CURRENTDIR/angular_client/modules/core/bower_components/fielddb/

echo "Using local fielddb angular";
rm bower_components/fielddb-angular/bower.json
rm -rf bower_components/fielddb-angular/dist
ln -s $CURRENTDIR/angular_client/modules/core/bower.json $CURRENTDIR/angular_client/modules/corpuspages/bower_components/fielddb-angular/bower.json;
ln -s $CURRENTDIR/angular_client/modules/core/dist $CURRENTDIR/angular_client/modules/corpuspages/bower_components/fielddb-angular/dist;
ls -al $CURRENTDIR/angular_client/modules/corpuspages/bower_components
ls -al $CURRENTDIR/angular_client/modules/corpuspages/bower_components/fielddb-angular/

gulp && {
  echo "Gulp was sucessfull";

  # gulp test && {
  #   echo "Gulp test was sucessfull";
  #   exit 0
  # } || {
  #   echo "gulp failed";
  #   exit 8
  # }
} || {
  echo "gulp failed";
  exit 8
}