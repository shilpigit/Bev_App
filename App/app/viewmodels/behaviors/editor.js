(function () {
    'use strict';

    define([
            'durandal/app',
            'services/core/logger',
            'services/data/datacontext'
        ],
        function (app, logger, datacontext) {

            var service = {
                extend: extend
            };

            function extend(vm, entitySet) {

                vm.entitySet = entitySet;
                vm.objectTypeCode = ko.observable();
                vm.companyId = ko.observable();
                vm.isDeleting = ko.observable();
                vm.isEditing = ko.observable();
                vm.canEdit = ko.observable(true);
                vm.canDelete = ko.observable(true);
                vm.loc = vm.loc || datacontext.translations.item;
                vm.selectedItem = ko.observable();
                vm.cancelDelete = cancelDelete;
                vm.cancelEdit = cancelEdit;
                vm.deleteItem = deleteItem;
                vm.editItem = editItem;
                vm.enterDelete = vm.enterDelete || function () {};
                vm.enterEdit = vm.enterEdit || function () {};
                vm.enterSave = vm.enterSave || function () {};
                vm.postDelete = vm.postDelete || function () {};
                vm.reloadData = vm.reloadData || function () {
                        vm.entitySet.getData();
                    };

                vm.compositionComplete = compositionComplete || function () {};
                vm.newItem = newItem;
                vm.setSelectedItem = setSelectedItem;
                vm.deleteItemCommand = deleteItemCommand();
                vm.selectedItemId = selectedItemId();
                vm.saveCommand = saveCommand();

                function cancelDelete() {
                    vm.isDeleting(false);
                }

                function cancelEdit() {                    
                    if (vm.selectedItem()) {
                        vm.selectedItem().revert();
                    }
                    vm.isEditing(false);
                }

                function deleteItem() {                    
                    vm.isDeleting(true);
                    vm.enterDelete();
                }

                function deleteItemCommand() {                    
                    vm.isDeleting(false);
                    return ko.command({
                        execute: function () {

                            vm.entitySet.deleteItem(vm.selectedItem().id());
                            vm.postDelete();
                            vm.isDeleting(false);
                        }
                    });
                }

                function editItem() {                    
                    vm.enterEdit();
                    vm.isEditing(true);
                }

                function newItem() {                    
                    vm.selectedItem(vm.entitySet.newItem());
                    vm.enterEdit();
                    vm.isEditing(true);
                }

                function selectedItemId() {                    
                    vm.isDeleting(false);
                    return ko.computed(function () {
                        if (vm.selectedItem() && vm.selectedItem().id) {
                            return vm.selectedItem() && vm.selectedItem().id();
                        }
                    });
                }

                function saveCommand() {                    
                    return ko.asyncCommand({
                        execute: function (callback) {
                            var args = vm.enterSave();

                            vm.entitySet.saveItem(vm.selectedItem(),
                                {
                                    success: function () {
                                        callback();

                                        vm.selectedItem().commit();
                                        vm.reloadData();
                                        vm.isEditing(false);

                                    },
                                    failure: function () {
                                        callback();
                                        logger.logError('An Error occurred while saving the item');
                                    }
                                }, args);

                            vm.isEditing(false);
                        }
                    });
                }

                function setSelectedItem(item) {                    
                    vm.selectedItem(item);
                }

                function compositionComplete() {
                    vm.isDeleting(false);
                    vm.selectedItem(null);
                    vm.cancelEdit();
                }
            }

            return service;
        });
})();
