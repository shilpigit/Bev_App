(function () {
    'use strict';

    define([
            'durandal/app',
            'durandal/system',
            'plugins/router',
            'services/core/config',
            'services/core/authentication',
            'services/data/datacontext',
            'services/data/dataprimer',
            'services/core/logger',
            'services/ko.mappinghandlers',
            'services/core/state',
            'services/utilities'],
        function (app, system, router, config, authentication, datacontext, dataprimer, logger, mappingHandlers, state, utilities) {

            var vm = {
                activate: activate,
                canActivate: canActivate,
                config: config,
                loc: datacontext.translations.item,
                router: router,
                user: datacontext.user.item.user,
                state: state,
                showNavbar: ko.observable(false),
                signout: signout,
                navigateHome: navigateHome
            };

            router.activeInstruction.subscribe(function (newValue) {
                vm.showNavbar(true);

                if (newValue) {
                    if (newValue.config.hideNavbar) {
                        vm.showNavbar(false);
                    }
                }
            });

            app.on('app:signout', function () {
                window.location.reload();
            });

            return vm;

            function activate() {

                var routes = getRoutes();

                dataprimer.init().always(function () {
                    router.makeRelative({moduleId: 'viewmodels'})
                        .map(routes)
                        .buildNavigationModel()
                        .activate();
                });

                navigator.getMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia);


            }

            function canActivate() {
                var dfd = $.Deferred();

                dataprimer.getCaptions().then(function () {
                    dfd.resolve(true);
                });

                return dfd.promise();
            }

            function getRoutes() {
                return [
                    {route: '', moduleId: 'home', title: 'Home', nav: true},
                    {route: 'viewcandidateprofile/(:code)', moduleId: 'viewCandidateProfile', title: 'View Candidate Profile', nav: true},
                    {route: 'viewcompanyprofile/(:code)', moduleId: 'viewCompanyProfile', title: 'View Company Profile', nav: true},
                    {route: 'viewvacancy/(:code)', moduleId: 'viewVacancy', title: 'Apply For Vacancy', nav: true},
                    {route: 'signin', moduleId: 'signin', title: 'Sign In', nav: true, hideNavbar: true},
                    {route: 'signin/(:redirect)', moduleId: 'signin', title: 'Sign In', nav: true, hideNavbar: true},
                    {route: 'signup', moduleId: 'signup', title: 'Sign Up', nav: true, hideNavbar: true},
                    {route: 'signupComplete/(:type)', moduleId: 'signupComplete', title: 'Sign Up Completed', nav: true, hideNavbar: true},
                    {route: 'home', moduleId: 'home', title: 'Home', nav: true},
                    {route: 'account', moduleId: 'account', title: 'Account', nav: true},
                    {route: 'admin', moduleId: 'admin', title: 'Admin', nav: true},
                    {route: 'troubleloggingin', moduleId: 'troubleloggingin', title: 'Trouble logging in?', nav: true, hideNavbar: true},
                    {route: 'resetConfirm', moduleId: 'resetConfirm', title: 'Confirm Reset Password', nav: true, hideNavbar: true},
                    {route: 'emailConfirm', moduleId: 'emailConfirm', title: 'Confirm EMail Address', nav: true, hideNavbar: true }
                    //{route: 'adminQuarterlyAwardsNominationForm', moduleId: 'adminQuarterlyAwardsNominationForm', title: 'Quaterly Awards Nomination Form', nav: true, hideNavbar: true }
                ];
            }

            function signout() {
                authentication.signout({
                    success: function () {
                        window.location = config.root ;
                    },
                    error: function () {
                        logger.log('Bang! Log out Fail!!!');
                    }
                });
            }

            function navigateHome() {

                var routTo = state.isAdministrator() ? 'admin' : 'home';
                var languageParam = utilities.getParameterValues('l');

                if (languageParam) {
                    router.navigate('#/' + routTo + '/?l=' + languageParam);
                } else {
                    router.navigate('#/' + routTo);
                }
            }
        });
}());
