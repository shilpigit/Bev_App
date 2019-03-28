//(function () {
//    'use strict';

//    define([
//        'durandal/app',
//        'plugins/router',
//        'services/core/logger',
//        'services/core/config',
//        'services/core/security',
//        'services/core/state',
//        'services/data/dataservice',
//        'services/data/datacontext',
//        'services/utilities',
//        'Clipboard',
//        'services/core/localization'
//        ],
//        function (config, localization, datacontext, editor, state) {

//            var Model = function () {
//                this.loc = datacontext.translations.item;
//                this.config = config;
//                this.state = state;
//                this.activate = activate;
//                this.title = 'Document Library';
//                this.documentLibraries = datacontext.documentLibraries.items;

//                this.selectedCover = {
//                    fileUrl: ko.observable(),
//                    fileReference: ko.observable(),
//                    contentType: ko.observable(),
//                    percentage: ko.observable(),
//                    uploadCompleted: ko.observable(),
//                    size: ko.observable(20000000),
//                    sizeIsValid: ko.observable(true)
//                };

//                this.selectedFile = {
//                    fileUrl: ko.observable(),
//                    fileReference: ko.observable(),
//                    contentType: ko.observable(),
//                    percentage: ko.observable(),
//                    uploadCompleted: ko.observable(),
//                    size: ko.observable(20000000),
//                    sizeIsValid: ko.observable(true)
//                };

//                this.selectedCover.fileUrl.subscribe(coverMediaChange, this);
//                this.selectedFile.fileUrl.subscribe(fileMediaChange, this);
//                this.enterSave = enterSave;
//                this.enterEdit = enterEdit;

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

//            editor.extend(vm, datacontext.documentLibraries);

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

//            function getSelectedContainer() {

//                for (var i = 0; i < vm.documentLibraries().length; i++) {
//                    if (vm.documentLibraries()[i].id() === vm.selectedItemId()) {
//                        return vm.documentLibraries()[i];
//                    }
//                }
//                return datacontext.documentLibraries.newItem();
//            }

//            function enterSave() {
//                return true;
//            }

//            function enterEdit() {

//                var container = getSelectedContainer();
//                if (container.coverFileLocation()) {
//                    vm.selectedCover.fileUrl(container.coverFileLocation());
//                }
//                else {
//                    vm.selectedCover.fileUrl(config.imageCdn + 'logo/logo-solo.png');
//                }
//            }

//            function coverMediaChange(newValue) {

//                if (newValue) {

//                    var container = getSelectedContainer();
//                    container.coverFileLocation(vm.selectedCover.fileUrl());
//                    container.coverFileReference(vm.selectedCover.fileReference());
//                    vm.selectedItem().coverFileReference(vm.selectedCover.fileReference());

//                }
//            }

//            function fileMediaChange(newValue) {
//                if (newValue) {

//                    var container = getSelectedContainer();
//                    container.fileLocation(vm.selectedFile.fileUrl());
//                    container.fileReference(vm.selectedFile.fileReference());
//                    vm.selectedItem().fileReference(vm.selectedFile.fileReference());
//                }
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
