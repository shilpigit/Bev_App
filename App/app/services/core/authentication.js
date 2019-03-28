(function () {
    'use strict';

    define(['durandal/app', 'services/core/config', 'services/core/state', 'services/core/logger'],
        function (app, config, state, logger) {

            var service = {
                authenticate: authenticate,
                getLocalAccessToken: getLocalAccessToken,
                loginWithProvider: loginWithProvider,
                register: register,
                registerExternal: registerExternal,
                signout: signout,
                validateUsername: validateUsername,
                recoverAccount: recoverAccount,
                confirmReset: confirmReset,
                confirmEmail: confirmEmail,
                changePassword: changePassword,
                getCompanyName: getCompanyName
            };

            function authenticate(loginData) {
                var data = 'grant_type=password&username=' + loginData.username + '&password=' + loginData.password;
                var tokenUrl = config.root + 'Token';
                var request = createRequest(tokenUrl, data);
                return $.ajax(request).done(function (result) {
                    state.setAuthData(
                        {
                            userId: result.userId,
                            /* jshint camelcase: false */
                            token: result.access_token,
                            password: loginData.password
                        });
                });
            }

            function loginWithProvider(provider, callback) {
                var redirectUri = location.protocol + '//' + location.host + '/auth-complete.html';
                var externalProviderUrl = config.root + 'api/Account/ExternalLogin?provider=' + provider + '&response_type=token&redirect_uri=' + redirectUri;
                window.authenticationCompleted = callback;
                window.open(externalProviderUrl, 'Authenticate Account', 'location=0,status=0,width=1024,height=768');
            }

            function register(signupData) {
                var request = createRequest(config.root + 'api/signup/', signupData);

                return $.ajax(request);
            }

            function registerExternal(providerData, invitation) {
                /* jshint camelcase: false */

                var signup = {
                    loginProvider: providerData.provider,
                    providerKey: providerData.external_access_token,
                    emailAddress: providerData.email ? providerData.email : providerData.email_address,
                    invitation: invitation,
                    name: providerData.name
                };

                var request = createRequest(config.root + 'api/signup/external', signup);

                return $.ajax(request).done(function (result) {
                    state.setAuthData(
                        {
                            userId: result.userId,
                            /* jshint camelcase: false */
                            token: result.access_token
                        });
                }).fail(function (jqXHR) {
                    logger.logError('Failed To Authenticate : ' + jqXHR.responseText);
                });
            }

            function getLocalAccessToken(providerData) {
                /* jshint camelcase: false */
                var params = {
                    provider: providerData.provider,
                    externalAccessToken: providerData.external_access_token
                };

                var request = createRequest(config.root + 'api/account/getLocalAccessToken', params);

                request.type = 'GET';

                return $.ajax(request).done(function (result) {
                    state.setAuthData(
                        {
                            userId: result.userId,
                            /* jshint camelcase: false */
                            token: result.access_token
                        });
                }).fail(function (jqXHR) {
                    logger.logError('Failed To Authenticate: ' + jqXHR);
                });
            }

            function signout() {
                // Clear out auth token
                state.setAuthData(null);

                // Raise event to let app know we've signed out
                app.trigger('app:signout');
            }

            function validateUsername(emailAddress) {
                var request = createRequest(config.root + 'api/account/checkusername/', {emailAddress: emailAddress});

                return $.ajax(request);
            }

            function getCompanyName(id) {
                var request = createRequest(config.root + 'api/company/companycontainer/getnameonly/', {company: {id: id}});

                return $.ajax(request);
            }

            function recoverAccount(emailAddress) {
                var request = createRequest(config.root + 'api/account/recoveraccount/', {emailAddress: emailAddress});

                return $.ajax(request);
            }

            function confirmReset(userId, token, newPassword) {
                var request = createRequest(config.root + 'api/account/confirmreset/', {
                    userId: userId,
                    token: token,
                    newPassword: newPassword
                });

                return $.ajax(request);
            }

            function confirmEmail(userId, accessRequestId, token) {
                var request = createRequest(config.root + 'api/account/confirmemail/', {
                    userId: userId,
                    accessRequestId: accessRequestId,
                    token: token
                });

                return $.ajax(request);
            }

            function changePassword(userId, currentPassword, newPassword) {
                var request = createRequest(config.root + 'api/account/changepassword/', {
                    userId: userId,
                    currentPassword: currentPassword,
                    newPassword: newPassword
                });

                return $.ajax(request);
            }

            function createRequest(url, data) {
                return {
                    url: url,
                    type: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
                    },
                    data: data
                };
            }

            return service;
        });
})();
