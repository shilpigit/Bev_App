(function () {
    'use strict';

    define([
            'plugins/router',
            'services/core/authentication',
            'services/data/datacontext',
            'services/core/config',
            'services/core/state',
            'services/utilities',
            'services/core/instrumentation'
        ],
        function (router, authentication, dataContext, config, state, utilities, instrumentationSrv) {

            var vm = {
                title: 'Trouble Logging in',
                config: config,
                loc: dataContext.translations.item,
                isBusy: ko.observable(false),
                username: ko.observable(),
                isShowingResetPassword: ko.observable(false),
                activate: activate,
                showResetPassword: showResetPassword,
                sendResetLink: sendResetLink,
                redirectParameters: ko.observable()
            };

            vm.validationModel = ko.validatedObservable({
                userName: vm.username,
                password: vm.password
            });

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            return vm;

            function showResetPassword() {
                vm.isShowingResetPassword(true);
            }

            function sendResetLink() {
                if (vm.validationModel.isValid()) {

                    instrumentationSrv.trackEvent('TroubleLoggingIn', {
                        'Command': 'SendResetLink',
                        'User': vm.username()
                    });

                    vm.isBusy(true);
                    authentication.recoverAccount(vm.username()).done(function () {
                        vm.messageDetail.message(vm.loc.textPasswordResetTip());
                        vm.messageDetail.type('success');
                    }).fail(function () {
                        vm.messageDetail.message(vm.loc.textSignupServerErrorMessage());
                        vm.messageDetail.type('danger');
                    }).always(function () {
                        vm.isShowingResetPassword(false);
                        vm.isBusy(false);
                    });
                }
            }

            function activate(redirect) {
                vm.redirect = redirect || '';
                vm.redirectParameters(utilities.getAllParametersWithValues());
                var languageCode = utilities.getParameterValues('l');

                if (languageCode) {
                    state.languageCode(languageCode);
                }

                dataContext.translations.getItem(state.languageCode()).then(function () {

                    vm.username.extend({
                        valueUpdate: 'afterKeyDown',
                        rateLimit: 3000,
                        required: {
                            message: vm.loc.textEnterEmailAddressAsAsernameMessage()
                        },
                        email: {
                            message: vm.loc.textMailSampleMessage()
                        }
                    });

                });
            }

        });
}());
