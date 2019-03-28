(function () {
    'use strict';

    define([
            'durandal/app',
            'plugins/router',
            'services/core/logger',
            'services/core/config',
            'services/data/dataservice',
            'services/data/datacontext',
            'services/core/instrumentation',
            'services/core/localization',
            'services/core/security'
        ],
        function (app, router, logger, config, dataservice, datacontext, instrumentationSrv) {
            var vm = {
                title: 'Candidates Panel',
                activate: activate,
                config: config,
                loc: datacontext.translations.item,
                currentUser: datacontext.user.item.user
            };

            return vm;


            function activate(id) {
                if (id) {
                    instrumentationSrv.trackEvent('PendingDashboard', {'View': 'Dashboard'});
                    return true;
                }
            }

        });
}());
