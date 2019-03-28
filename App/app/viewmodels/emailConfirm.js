(function () {
    'use strict';

    define([
            'plugins/router',
            'services/core/authentication',
            'services/data/datacontext',
            'services/core/config',
            'services/core/logger'
        ],
        function (router, authentication, dataContext, config) {

            var vm = {
                self: this,
                title: 'Confirm Email Address',
                loc: dataContext.translations.item,
                config: config,
                isBusy: ko.observable(false),
                token: ko.observable(),
                userId: ko.observable(),
                accessRequestId: ko.observable(),
                activate: activate,
                isDone: ko.observable(false)
            };

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            return vm;

            function activate(context) {
                vm.userId(context.u);
                vm.token(context.t);

                if (!vm.token() || !vm.userId()) {
                    vm.messageDetail.message(vm.loc.textMissdirectedMessage());
                    vm.messageDetail.type('error');
                    return;
                } else {
                    vm.isBusy(true);
                    authentication.confirmEmail(vm.userId(), vm.accessRequestId(), vm.token()).done(function () {

                        vm.messageDetail.message(vm.loc.stringEmailConfirmed());
                        vm.messageDetail.type('info');
                        vm.isDone(true);

                    }).fail(function () {

                        vm.messageDetail.message(vm.loc.textExperiencingProblem());
                        vm.messageDetail.type('warning');

                    }).always(function () {
                        vm.isBusy(false);
                    });
                }
            }
        });
}());