(function () {
    'use strict';

    define(['services/core/authentication',
            'services/core/config',
            'plugins/router',
            'services/core/logger',
            'services/data/dataprimer',
            'services/core/state',
            'services/data/datacontext',
            'services/utilities',
            'services/core/instrumentation'
        ],
        function (authentication, config, router, logger, dataprimer, state, datacontext, utilities, instrumentationSrv) {

            var vm = {
                title: 'Sign In',
                config: config,
                loc: datacontext.translations.item,
                isBusy: ko.observable(false),
                firstName: ko.observable(),
                lastName: ko.observable(),
                password: ko.observable(),
                username: ko.observable(),
                externalAuthFragment: ko.observable(),
                isConfirmingSignin: ko.observable(false),
                isClient: ko.observable(false),
                isValidCompanyCode: ko.observable(),
                isValidatingCompanyCode: ko.observable(),
                companyCode: ko.observable('odg'),
                companyName: ko.observable(),
                showCompanyValidationError: ko.observable(),
                redirectParameters: ko.observable(),
                vacancyCode: ko.observable(),
                activate: activate,
                canActivate: canActivate,
                completeExternalSignup: completeExternalSignup,
                login: login,
                loginFacebook: loginFacebook,
                loginGoogle: loginGoogle,
                isValid: isValid
            };

            vm.companyCode.subscribe(validateCompanyCode);

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.validationModel = ko.validatedObservable({
                userName: vm.username,
                password: vm.password
            });

            vm.statedLanguage = ko.computed(function () {
                return state.languageCode();
            }, this);

            vm.languageAddOn = ko.computed(function () {
                return '?l=' + state.languageCode();
            }, this);

            vm.signupLink = ko.computed(function () {
                
                var url = vm.isClient() ? config.sponsorshipPackageUrl : '#/signup';
                return vm.redirectParameters() ? url + '&' + vm.redirectParameters() : url;
            }, this);

            return vm;

            function activate(redirect) {

                instrumentationSrv.trackEvent('SignIn',
                    {
                        'On': 'Loaded'
                    });

                vm.redirectParameters(utilities.getAllParametersWithValues());

                vm.redirect = redirect || '';

                var isClient = utilities.getParameterValues('t');
                vm.isClient(isClient && isClient === 'c');

                var languageCode = utilities.getParameterValues('l');
                languageCode = languageCode ? languageCode.toLowerCase() : 'en';
                state.languageCode(languageCode);

                datacontext.translations.getItem(state.languageCode()).then(function () {

                    vm.password.extend({
                        required: {
                            message: vm.loc.textEnterYourPasswordMessage()
                        }
                    });

                    vm.username.extend({
                        valueUpdate: 'afterKeyDown',
                        rateLimit: 500,
                        required: {
                            message: vm.loc.textEnterEmailAddressAsAsernameMessage()
                        },
                        email: {
                            message: vm.loc.textMailSampleMessage()
                        }
                    });

                });
            }

            function canActivate() {

                var vacancyCodeParam = utilities.getParameterValues('vc');
                if (vacancyCodeParam && vacancyCodeParam !== undefined) {
                    vm.vacancyCode(vacancyCodeParam);
                }

                if (state.isAuthenticated()) {

                    var shell = require('viewmodels/shell');

                    if (vm.vacancyCode()) {
                        router.navigate('viewvacancy/' + vm.vacancyCode());
                        return true;
                    }
                    else {
                        shell.navigateHome();
                        return true;
                    }
                }
                else {
                    return true;
                }
            }

            function isValid() {
                return true;
            }

            function login() {

                if (vm.validationModel.isValid()) {

                    instrumentationSrv.trackEvent('LogIn',
                        {
                            'Command': 'LogIn',
                            'UserName': vm.username()
                        });

                    vm.isBusy(true);

                    var loginData = {
                        username: vm.username(),
                        password: vm.password()
                    };

                    authentication.authenticate(loginData)
                        .done(function () {

                            dataprimer.init(true).then(function () {

                                if (vm.vacancyCode()) {
                                    router.navigate('viewvacancy/' + vm.vacancyCode());
                                }
                                else {
                                    vm.redirect = state.isAdministrator() ? 'admin' : vm.redirect;
                                    router.navigate(vm.redirect);
                                }

                                vm.isBusy(false);
                            });
                        })
                        .fail(function (jqXHR) {

                            var responseText = $.parseJSON(jqXHR.responseText);

                            if (responseText.error === 'unconfirmed_user') {
                                vm.messageDetail.message(vm.loc.textAccountIsNotApprovedMessage());
                                vm.messageDetail.type('info');
                            }
                            else {
                                vm.messageDetail.message(vm.loc.textIncorrectUsernameOrPasswordMessage());
                                vm.messageDetail.type('warning');
                            }

                            logger.log('Authentication Failed: ' + responseText.error);

                            vm.isBusy(false);
                        });
                }
                else {
                    vm.messageDetail.message(vm.loc.textEnterUsernameAndPasswordMessage());
                    vm.messageDetail.type('warning');
                }
            }

            function loginFacebook() {

                instrumentationSrv.trackEvent('LogIn',
                    {
                        'Command': 'LogIn-Social',
                        'Name': 'Facebook'
                    });

                authentication.loginWithProvider('Facebook', authenticationCompleted);
            }

            function loginGoogle() {

                instrumentationSrv.trackEvent('LogIn',
                    {
                        'Command': 'LogIn-Social',
                        'Name': 'Google'
                    });

                authentication.loginWithProvider('Google', authenticationCompleted);
            }

            function completeExternalSignup(fragment) {

                vm.isBusy(true);

                authentication.registerExternal(vm.externalAuthFragment(), vm.companyCode()).done(function () {

                    authentication.getLocalAccessToken(fragment).then(function () {
                        dataprimer.init(true).then(function () {

                            if (vm.vacancyCode()) {
                                router.navigate('viewvacancy/' + vm.vacancyCode());
                            }
                            else {
                                router.navigate(vm.redirect);
                            }

                            vm.isBusy(false);
                        });
                    });

                }).fail(function () {
                    vm.isBusy(false);

                    logger.logError('Failed to Create New Account for External long.');
                });
            }

            function authenticationCompleted(fragment) {
                if (fragment.haslocalaccount === 'False') {
                    vm.externalAuthFragment(fragment);
                    vm.isConfirmingSignin(true);
                    completeExternalSignup(fragment);
                }
                else {

                    vm.isBusy(true);

                    authentication.getLocalAccessToken(fragment).then(function () {
                        dataprimer.init().then(function () {

                            if (vm.vacancyCode()) {
                                router.navigate('viewvacancy/' + vm.vacancyCode());
                            }
                            else {
                                router.navigate(vm.redirect);
                            }

                            vm.isBusy(false);
                        });
                    });
                }
            }

            function validateCompanyCode(newValue) {
                vm.showCompanyValidationError(false);

                if (newValue.length === 5 && !vm.isValidCompanyCode()) {
                    vm.isValidatingCompanyCode(true);

                    authentication.validateCompanyCode(newValue).done(function (result) {
                        vm.isValidCompanyCode(true);
                        vm.isValidatingCompanyCode(false);
                        vm.companyName(result.name);

                    }).fail(function () {
                        vm.isValidatingCompanyCode(false);
                        vm.companyName('Company not found');
                        vm.showCompanyValidationError(true);

                    }).always(function () {
                        vm.isValidatingCompanyCode(false);
                    });
                }
                else {
                    vm.isValidCompanyCode(false);
                    vm.isValidatingCompanyCode(false);
                    vm.companyName(null);
                }
            }
        });
}());
