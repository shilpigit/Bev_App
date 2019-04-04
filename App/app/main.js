(function () {
    'use strict';

    requirejs.config({
        paths: {
            'text': '../bower_components/requirejs-text/text',
            'durandal': '../bower_components/durandal/js',
            'plugins': '../bower_components/durandal/js/plugins',
            'transitions': '../bower_components/durandal/js/transitions',
            'amplify': '../bower_components/amplify/lib/amplify',
            'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap',
            'bootstrap-datepicker': '../bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker',
            'bootstrap-datetimepicker': '../bower_components/bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min',
            'knockout': '../bower_components/knockout/dist/knockout',
            'knockout-mapping': '../bower_components/knockout-mapping/knockout.mapping',
            'knockout-validation': '../bower_components/knockout-validation/dist/knockout.validation',
            'knockout-activity': '../scripts/knockout.activity',
            'knockout-command': '../scripts/knockout.command',
            'knockout-autocomplete': '../scripts/knockout.autocomplete',          
            'modernizr': '../bower_components/modernizr/modernizr',
            'moment': '../bower_components/moment/moment',
            'jquery': '../bower_components/jquery/jquery',
            'toastr': '../bower_components/toastr/toastr',
            'Clipboard': '../bower_components/clipboard/dist/clipboard',
            'jqueryTinymce': '../bower_components/tinymce/jquery.tinymce',
            'tinymce': '../bower_components/tinymce/tinymce'
        },
        shim: {
            'amplify' : {
                deps: ['jquery'],
                exports: 'amplify'
            },
            'bootstrap': {
                deps: ['jquery']
            },
            'bootstrap-datepicker': {
                deps: ['jquery']
            },
            'bootstrap-datetimepicker': {
                deps: ['jquery']
            },
            'Clipboard': {
                deps: ['jquery'],
                exports: 'Clipboard'
            },
            'tinymce': {
                deps: ['jquery','jqueryTinymce'],
                exports: 'tinymce'
            }
        }
    });

    define('knockout', ko);

    define(['durandal/app',
            'durandal/viewLocator',
            'durandal/system',
            'plugins/router',
            'services/core/config',
            'services/data/dataprimer',
            'services/core/logger',
            'services/core/instrumentation',
            'toastr',
            'knockout-mapping',
            'knockout-command',
            'knockout-autocomplete',
            'knockout-validation',
            'knockout-activity',
            'services/ko.mappinghandlers',
            'amplify',
            'bootstrap',
            'bootstrap-datepicker',
            'bootstrap-datetimepicker',
            'Clipboard'
            ],
        function (app, viewLocator, system, router,  config, dataprimer, logger, instrumentation, toastr, koMapping, koCommand) {
            app.title = 'Oil Diversity';

            //>>excludeStart("build", true);
            system.debug(true);
            //>>excludeEnd("build")

            ko.mapping = koMapping;
            ko.command= koCommand.command;
            ko.asyncCommand= koCommand.asyncCommand;

            app.configurePlugins({
                router: true,
                dialog: true
            });

            app.start().then(function () {
                toastr.options.positionClass = 'toast-top-right';
                toastr.options.backgroundpositionClass = 'toast-top-right';
                toastr.options.progressBar = true;
                toastr.options.newestOnTop = true;
                toastr.options.timeOut = '3000';
                toastr.options.preventDuplicates = true;

                router.handleInvalidRoute = function (route) {
                    logger.logError('Cannot find any route ', route, 'main', true);
                };

                ko.validation.init({
                    errorElementClass: 'has-error',
                    errorMessageClass: 'help-block',
                    decorateElement: true,
                    insertMessages: false
                });

                viewLocator.useConvention();

                app.setRoot('viewmodels/shell', 'entrance');
            });

        });
}());
