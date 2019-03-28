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
                title: 'Confirm Reset Password',
                loc: dataContext.translations.item,
                config: config,
                isBusy: ko.observable(false),
                token: ko.observable(),
                userId: ko.observable(),
                activate: activate,
                resetPassword: resetPassword,
                isDone: ko.observable(false)
            };

            vm.password = ko.observable()
                .extend({
                    valueUpdate: 'afterKeyDown',
                    rateLimit: 2000,
                    required: {
                        message: vm.loc.textChooseAPassword()
                    },
                    minLength: {
                        params: 6,
                        message: vm.loc.textPasswordLenghtMessage()
                    }
                });
            vm.confirmPassword = ko.observable()
                .extend({
                    valueUpdate: 'afterKeyDown',
                    rateLimit: 2000,
                    validation: {
                        validator: function (val, params) {
                            return val === ko.validation.utils.getValue(params);
                        },
                        message: vm.loc.stringPasswordsDoNotMatchMessage(),
                        params: vm.password
                    },
                    minLength: {
                        params: 6,
                        message: vm.loc.textPasswordLenghtMessage()
                    }
                });

            vm.validationModel = ko.validatedObservable({
                password: vm.password,
                confirmPassword: vm.confirmPassword
            });

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            return vm;

            function resetPassword() {

                if (vm.validationModel.isValid()) {
                    if (!vm.token() || !vm.userId()) {
                        vm.messageDetail.message(vm.loc.textMissdirectedMessage());
                        vm.messageDetail.type('error');
                        return;
                    } else {
                        vm.isBusy(true);
                        authentication.confirmReset(vm.userId(), vm.token(), vm.password()).done(function () {
                            vm.messageDetail.message(vm.loc.stringPasswordHasReset());
                            vm.messageDetail.type('info');
                            vm.isDone(true);
                        }).fail(function () {
                            vm.messageDetail.message(vm.loc.textExperiencingProblem());
                            vm.messageDetail.type('info');
                        }).always(function () {
                            vm.isBusy(false);
                        });
                    }
                } else {
                    vm.messageDetail.message(vm.loc.textDoubleCheckPasswordsEntered());
                    vm.messageDetail.type('warning');
                    return;
                }
            }

            function activate(context) {
                vm.userId(context.u);
                vm.token(context.t);
            }
        });
}());