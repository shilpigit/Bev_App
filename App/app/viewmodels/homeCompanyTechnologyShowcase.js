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
        'services/data/datacontext'
    ],
        function (app, router, logger, config, security, state, dataservice, datacontext) {
            var vm = {
                activate: activate,
                canActivate: canActivate,
                title: 'Technology Showcase',
                config: config,
                loc: datacontext.translations.item,
                state: state,
                contentToShow: ko.observable(),
                currentUser: datacontext.user.item.user
            };

            return vm;

            function canActivate() {

                return true;
            }

            function activate() {
                ko.utils.arrayFilter(datacontext.contents.items(), function (el) {

                    //if (el.keyCodeValue() === 'cCompanyPanelMentoringPortalContentKey') {
                    //    vm.contentToShow(el.text());
                    //}
                });
                return true;
            }
        });
}());