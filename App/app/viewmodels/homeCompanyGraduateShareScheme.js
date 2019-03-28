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
            'services/utilities'
        ],
        function (app, router, logger, config, security, state, dataservice, datacontext, utilities) {
            var vm = {
                activate: activate,
                canActivate: canActivate,
                utilities: utilities,
                title: 'Industry Award',
                config: config,
                loc: datacontext.translations.item,
                state: state,
                currentUser: datacontext.user.item.user
            };

            return vm;

            function canActivate() {

                return true;
            }

            function activate() {
                return true;
            }
        });
}());
