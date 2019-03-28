(function () {
    'use strict';

    define(['services/data/datacontext',
            'services/core/logger',
            'services/core/state',
            'services/utilities',
            'services/core/config'],
        function (datacontext, logger, state, utilities, config) {

            var vm = {
                title: 'Sign up completed',
                config: config,
                activate: activate,
                loc: datacontext.translations.item,
                isCompany: ko.observable(false)
            };

            return vm;

            function activate(code) {

                var languageCode = utilities.getParameterValues('l');

                if (languageCode) {
                    state.languageCode(languageCode);
                    datacontext.translations.getItem(state.languageCode()).then(function () {
                    });
                }

                if(code === 'company'){
                    vm.isCompany(true);

                }

            }
        }
    );
}());
