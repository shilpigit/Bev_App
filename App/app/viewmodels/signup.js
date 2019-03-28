(function () {
    'use strict';

    define([
            'plugins/router',
            'services/core/authentication',
            'services/core/config',
            'services/data/dataprimer',
            'services/core/logger',
            'services/data/datacontext',
            'services/core/state',
            'services/utilities',
            'services/core/instrumentation',
            'services/company'
        ],
        function (router, authentication, config, dataprimer, logger, datacontext, state, utilities, instrumentationSrv) {

            var vm = {
                title: 'Sign Up',
                config: config,
                isBusy: ko.observable(false),
                loc: datacontext.translations.item,
                emailAddress: ko.observable(),
                firstName: ko.observable(),
                lastName: ko.observable(),
                password: ko.observable(),
                confirmPassword: ko.observable(),
                companyName: ko.observable(),
                isValidCompanyCode: ko.observable(true),
                isValidUsername: ko.observable(),
                isValidatingCompanyCode: ko.observable(),
                isValidatingUsername: ko.observable(),
                showCompanyValidationError: ko.observable(),
                showUsernameValidationError: ko.observable(),
                isAgree: ko.observable(false),
                subscribeForUpdate: ko.observable(false),
                hasCompanyCode: ko.observable(true),
                packageCode: ko.observable(),
                isInvitee: ko.observable(false),
                isValidInvitee: ko.observable(true),
                companyCode: ko.observable(),
                accessListCode: ko.observable(),
                principalCode: ko.observable(),
                activate: activate,
                compositionComplete: compositionComplete,
                loginFacebook: loginFacebook,
                loginGoogle: loginGoogle,
                signup: signup,
                validateUsername: validateUsername,
                redirectParameters: ko.observable()
            };

            vm.emailAddress.subscribe(validateUsername);

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.invitationMessage = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.validationModel = ko.validatedObservable({
                userName: vm.username,
                password: vm.password,
                confirmPassword: vm.confirmPassword,
                firstName: vm.firstName,
                lastName: vm.lastName,
                emailAddress: vm.emailAddress
            });

            // todo: move to Config or make a method in utility for GUID manipulation
            vm.guidEmpty = '00000000-0000-0000-0000-000000000000';

            return vm;

            function activate() {

                instrumentationSrv.trackEvent('SignUp',
                    {
                        'On': 'Loaded'
                    });

                vm.redirectParameters(utilities.getAllParametersWithValues());

                vm.packageCode(utilities.getParameterValues('pc'));

                var languageCode = utilities.getParameterValues('l');

                if (languageCode) {
                    state.languageCode(languageCode);
                }

                datacontext.translations.getItem(state.languageCode()).then(function () {

                    vm.emailAddress.extend({
                        valueUpdate: 'afterKeyDown',
                        rateLimit: 500,
                        required: {
                            message: vm.loc.textEnterEmailAddressAsAsernameMessage()
                        },
                        email: {
                            message: vm.loc.textMailSampleMessage()
                        }
                    });

                    vm.firstName.extend({
                        required: {
                            message: vm.loc.textEnterFirstName()
                        }
                    });

                    vm.lastName.extend({
                        required: {
                            message: vm.loc.textEnterLastName()
                        }
                    });

                    vm.password.extend({
                        required: {
                            message: vm.loc.textChooseAPassword()
                        },
                        minLength: {
                            params: 6,
                            message: vm.loc.textPasswordLenghtMessage()
                        }
                    });

                    vm.confirmPassword.extend({
                        required: {
                            message: vm.loc.textReEnterChosenPassword()
                        }
                    });

                    if (vm.packageCode()) {

                        vm.companyName.extend({
                            required: {
                                message: vm.loc.textEnterCompanyName()
                            }
                        });
                    }

                });


                vm.companyCode(utilities.getParameterValues('ci'));
                vm.accessListCode(utilities.getParameterValues('ai'));
                vm.principalCode(utilities.getParameterValues('pi'));

                if (vm.companyCode() && vm.accessListCode() && vm.principalCode()) {

                    vm.isInvitee(true);
                    vm.isValidInvitee(false);

                    authentication.getCompanyName(vm.companyCode())
                        .done(function (returnedCompanyInfo) {

                            if (returnedCompanyInfo.company.name) {
                                vm.invitationMessage.message(vm.loc.stringSignUpInvitedNote() + returnedCompanyInfo.company.name);
                                vm.invitationMessage.type('info');
                                vm.isValidInvitee(true);

                                vm.companyName(returnedCompanyInfo.company.name);

                            } else {
                                vm.invitationMessage.message(vm.loc.stringCompanyNotFound());
                                vm.invitationMessage.type('danger');
                            }

                        })
                        .fail(function () {
                            vm.invitationMessage.message(vm.loc.textSignupServerErrorMessage());
                            vm.invitationMessage.type('danger');
                        })
                        .always();
                } else {
                    vm.isInvitee(false);
                }

            }

            function compositionComplete(view) {
                $('[data-toggle="tooltip"]', view).tooltip();
            }

            function loginFacebook() {
                loginWithProvider('Facebook');
            }

            function loginGoogle() {
                loginWithProvider('Google');
            }

            function loginWithProvider(provider) {
                var redirectUri = location.protocol + '//' + location.host + '/auth-complete.html';
                var externalProviderUrl = config.root + 'api/Account/ExternalLogin?provider=' + provider + '&response_type=token&redirect_uri=' + redirectUri;

                window.authenticationCompleted = authenticationCompleted;
                window.open(externalProviderUrl, 'Authenticate Account', 'location=0,status=0,width=600,height=750');
            }

            function signup() {

                if (validate()) {
                    showMessage('', '');

                    vm.isBusy(true);

                    // todo: let's create a model for this guy too later
                    var signupData = {
                        emailAddress: vm.emailAddress(),
                        firstName: vm.firstName(),
                        lastName: vm.lastName(),
                        password: vm.password(),
                        confirmPassword: vm.confirmPassword(),
                        languageCode: state.languageCode(),
                        packageCode: vm.packageCode(),
                        subscribeForUpdate: vm.subscribeForUpdate(),
                        companyName: vm.companyName(),
                        invitationInfo: {
                            principalId: vm.principalCode(),
                            accessListId: vm.accessListCode(),
                            companyId: vm.companyCode()
                        }
                    };

                    instrumentationSrv.trackEvent('SignUp',
                        {
                            'On': 'ReadyToRegister',
                            'UserName': vm.emailAddress(),
                            'CompanyName': vm.companyName()
                        });

                    authentication.register(signupData)
                        .done(function (result) {

                            instrumentationSrv.trackEvent('SignUp',
                                {
                                    'On': 'Registered',
                                    'UserName': vm.emailAddress(),
                                    'CompanyName': vm.companyName()
                                });

                            if (result !== vm.guidEmpty) {
                                if(vm.packageCode()){
                                    router.navigate('signupComplete/company');
                                }else {
                                    router.navigate('signupComplete/candidate');
                                }
                            }
                            else {
                                showMessage(vm.loc.textSignupServerErrorMessage, 'danger');
                            }
                        })
                        .fail(function (result) {
                            logger.log(result);
                            showMessage(vm.loc.textSignupServerErrorMessage, 'danger');
                        })
                        .always(function () {
                            vm.isBusy(false);
                        });
                }
            }

            function authenticationCompleted(fragment) {
                if (fragment.haslocalaccount === 'False') {
                    authentication.registerExternal(fragment, vm.companyCode()).done(function () {
                        router.navigate('signupComplete');
                    }).fail(function () {
                        logger.logError('Authentication Failed.');
                    });
                }
                else {
                    vm.isBusy(true);
                    state.systemIsBusy(true);

                    authentication.getLocalAccessToken(fragment).then(function () {
                        dataprimer.init().then(function () {
                            router.navigate();

                            vm.isBusy(false);
                            state.systemIsBusy(false);
                        });
                    });
                }
            }

            function validate() {
                if (!vm.isValidInvitee()) {
                    vm.invitationMessage.message(vm.loc.stringCompanyNotFound());
                    vm.invitationMessage.type('danger');
                    return;
                }

                if (!vm.isAgree()) {
                    vm.invitationMessage.message(vm.loc.textAcceptAgreementMessage());
                    vm.invitationMessage.type('warning');
                    return;
                }

                if (!vm.isValidUsername()) {
                    showMessage(vm.loc.stringChosenEmailIsNotValidMessage(), 'warning');
                    return;
                }

                if (!vm.validationModel.isValid()) {
                    showMessage(vm.loc.stringFillFormCompletely(), 'warning');
                    return;
                }

                if (vm.password() !== vm.confirmPassword()) {
                    showMessage(vm.loc.stringPasswordsDoNotMatchMessage(), 'warning');
                    return;
                }

                showMessage('', '');
                return true;
            }

            function validateUsername(newValue) {

                if (!vm.isValidInvitee()) {
                    return;
                }

                vm.showUsernameValidationError(false);

                if (newValue.length > 0 && utilities.validateEmail(newValue)) {
                    vm.isValidatingUsername(true);
                    state.systemIsBusy(true);

                    authentication.validateUsername(newValue).done(function (result) {

                        if (result.id === vm.guidEmpty) {
                            showMessage('', '');
                            vm.isValidUsername(true);
                            vm.showUsernameValidationError(false);
                        } else {
                            showMessage(vm.loc.textEmailAddressTakenMessage(), 'warning');
                            vm.isValidUsername(false);
                            vm.showUsernameValidationError(true);
                        }

                    }).fail(function () {
                        showMessage(vm.loc.textSignupServerErrorMessage(), 'danger');
                        vm.isValidUsername(false);
                        vm.showUsernameValidationError(true);
                    }).always(function () {
                        vm.isValidatingUsername(false);
                        state.systemIsBusy(false);
                    });
                }
                else {
                    vm.isValidUsername(false);
                    vm.isValidatingUsername(false);
                    state.systemIsBusy(false);
                }
            }

            function showMessage(message, type) {
                vm.messageDetail.message(message);
                vm.messageDetail.type(type);
            }
        });
}());
