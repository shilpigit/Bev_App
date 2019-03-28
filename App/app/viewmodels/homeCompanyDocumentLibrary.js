//(function () {
//    'use strict';

//    define([
//            'services/core/config',
//            'services/core/localization',
//            'services/data/datacontext',
//            'viewmodels/behaviors/editor',
//            'services/core/state',
//            'services/utilities'
//        ],
//        function (config, localization, datacontext, editor, state,utilities) {

//            var Model = function () {
//                this.loc = datacontext.translations.item;
//                this.config = config;
//                this.state = state;
//                this.utilities = utilities;
//                this.activate = activate;
//                this.title = 'Document Library';
//                this.documentLibraries = datacontext.documentLibraries.items;
//            };

//            var vm = new Model();

//            // todo: work on knockout mappings to bind inner computed observables too
//            vm.getRelativePostedDateTime = function (item) {

//                if (item.postedDateTime()) {
//                    return moment(item.postedDateTime()).fromNow();
//                }
//                else {
//                    return 'Who Knows!';
//                }

//            };

//            vm.getRelativeUpdateDateTime = function (item) {

//                if (item.lastUpdateDateTime()) {
//                    return moment(item.lastUpdateDateTime()).fromNow();
//                }
//                else {
//                    return 'Who Knows!';
//                }

//            };

//            return vm;

//            function activate() {
//                ko.bindingHandlers.wysiwyg.defaults = {
//                    'toolbar': 'undo redo | bold italic | bullist numlist ',
//                    'menubar': false,
//                    'statusbar': false,
//                    'setup': function (ed) {
//                        ed.on('keydown', function (event) {
//                            if (event.keyCode === 9) { // tab pressed
//                                if (event.shiftKey) {
//                                    ed.execCommand('Outdent');
//                                }
//                                else {
//                                    ed.execCommand('Indent');
//                                }

//                                event.preventDefault();
//                                return false;
//                            }
//                        });
//                    }
//                };
//            }

//        });
//}());


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
        'services/data/datacontext',
        'services/utilities',
        'Clipboard',
        'services/core/localization'
    ],
        function (app, router, logger, config, security, state, dataservice, datacontext) {
            var vm = {
                activate: activate,
                canActivate: canActivate,
                title: 'Document Library',
                config: config,
                loc: datacontext.translations.item
            };
            return vm;

            function canActivate() {

            }

            function activate() {

            }

        });
}());
