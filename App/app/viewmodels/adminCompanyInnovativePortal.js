(function () {
    'use strict';

    define([
            'durandal/app',
            'plugins/router',
            'services/core/logger',
            'services/core/config',
            'services/core/security',
            'services/core/state',
            'services/data/dataservice',
            'services/data/datacontext',
            'services/utilities',
            'Clipboard',
            'services/core/localization'
        ],
        function (app, router, logger, config, security, state, dataservice, datacontext) {
            var vm = {
                activate: activate,
                canActivate: canActivate,
                title: 'Innovative Portal',
                config: config,
                loc: datacontext.translations.item

            };

            return vm;

            function canActivate() {

            }

            function activate() {

            }

        });
}());
