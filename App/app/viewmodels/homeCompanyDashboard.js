(function () {
    'use strict';

    define([
            'durandal/app',
            'plugins/router',
            'services/core/logger',
            'services/core/config',
            'services/data/dataservice',
            'services/data/datacontext',
            'services/core/security',
            'services/core/localization'
        ],
        function (app, router, logger, config, dataservice, datacontext, security) {
            var vm = {
                title: 'Companies Panel',
                activate: activate,
                security: security,
                config: config,
                loc: datacontext.translations.item,
                currentUser: datacontext.user.item.user,
                parent: ko.observable(),
                setSelectedView: setSelectedView,
                showHelp: showHelp
            };

            return vm;

            function showHelp(){
                logger.logWarning(vm.loc.stringPermissionTip());
            }
            function setSelectedView(view){
                vm.parent().setSelectedView(view);
            }

            function activate() {
                vm.parent( require('viewmodels/homeCompany'));
            }

        });
}());
