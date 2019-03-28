(function () {
    'use strict';

    define([
            'durandal/app',
            'plugins/router',
            'services/core/logger',
            'services/core/config',
            'services/data/dataservice',
            'services/data/datacontext',
            'services/core/localization',
            'services/core/security'
        ],
        function (app, router, logger, config, dataservice, datacontext) {
            var vm = {
                title: 'Companies Panel',
                activate: activate,
                config: config,
                loc: datacontext.translations.item,
                currentUser: datacontext.user.item.user,
                parent: ko.observable(),
                setSelectedView: setSelectedView
            };

            return vm;

            function setSelectedView(view){
                vm.parent().setSelectedView(view);
            }

            function activate() {
                vm.parent( require('viewmodels/homeUser'));
           }

        });
}());
