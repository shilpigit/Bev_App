(function () {
    'use strict';

    define(['services/core/logger',
            'services/data/datacontext',
            'services/data/dataservice',
            'services/core/security',
            'model/model',
            'services/core/state'],
        function (logger, datacontext, dataserivce, security, model, state) {

            var service = {
                getByUser: getByUser,
                getContainer: getContainer,
                getItemByOrganizationId: getItemByOrganizationId,
                getById: getById,
                reload: reload,
                hardReload: hardReload
            };

            return service;

            function getContainer(id) {

                return $.Deferred(function (def) {
                    dataserivce.company.getContainer({
                        success: function (dto) {
                            var item = new model.CompanyContainer();
                            item.update(dto);

                            def.resolve();
                            return item;
                        },
                        error: function () {
                            logger.log('Get Company Container Error');
                            def.reject();
                        }
                    }, id);
                }).promise();
            }

            function getByUser() {
                // Todo: this should filter list based on security rights of user
                // (companies where user has rights to create vacancies maybe)

                return ko.utils.arrayFilter(datacontext.companies.items(), function (item) {
                    return security.checkPartyAccess(item.id(), 'vacancy', 'create');
                });
            }

            function getItemByOrganizationId(id) {
                var matchingItems = ko.utils.arrayFilter(datacontext.companies.items(), function (el) {
                    return el.organizationId() === id;
                });

                if (matchingItems.length === 1) {
                    return matchingItems[0];
                }

                throw new Error('Unable to find item with id ' + id);
            }

            function getById(id) {
                var matchingItems = ko.utils.arrayFilter(datacontext.companies.items(), function (el) {
                    return el.company.id() === id;
                });

                if (matchingItems.length === 1) {
                    return matchingItems[0];
                }

                throw new Error('Unable to find item with id ' + id);
            }

            function reload() {

                state.systemIsBusy(true);
                datacontext.companies.getData(state.userId).then(function () {
                    state.systemIsBusy(false);
                });
            }

            function hardReload() {

                state.systemIsBusy(true);
                return $.Deferred(function (def) {
                    dataserivce.company.invalidateCache({
                        success: function () {
                            reload();
                            state.systemIsBusy(false);
                            def.resolve();
                        },
                        error: function () {
                            logger.log('Get Company Container Error');
                            state.systemIsBusy(false);
                            def.reject();
                        }
                    });
                }).promise();
            }
        });
})();
