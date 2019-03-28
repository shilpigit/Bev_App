(function () {
    'use strict';

    define([
            'durandal/system',
            'services/core/config',
            'services/data/dataservice',
            'services/data/entity',
            'services/data/entitySet'
        ],
        function (system, config, dataservice, Entity, EntitySet) {

            var service = {
                
                user: new Entity(dataservice.user.getItem, dataservice.user.newPrincipal, dataservice.user.saveItem),
                userLookup: new Entity(dataservice.user.getByUserName, dataservice.user.newUser),
                translations: new Entity(dataservice.translation.getItem, dataservice.translation.newItem),
                vacancy: new Entity(dataservice.vacancy.getItem, dataservice.vacancy.newItem),
                candidateProfile: new Entity(dataservice.candidateProfile.getItem, dataservice.candidateProfile.newItem),
                candidateProfilePagedSearch: new Entity(dataservice.candidateProfile.searchPaged, dataservice.candidateProfile.newPagedItem),
                //companyCandidateProfileSearch: new Entity(dataservice.company.SearchCompanyPaged, dataservice.company.newItem),
                vacancyPagedSearch: new Entity(dataservice.vacancy.searchPaged, dataservice.vacancy.newPagedItem),
                vacancyApplicantPagedSearch: new Entity(dataservice.vacancyApplicant.getPagedApplication, dataservice.vacancyApplicant.newPagedVacancyApplicationItem),

                accessRequests: new EntitySet(dataservice.accessRequest.getItems, dataservice.accessRequest.newItem, dataservice.accessRequest.saveItem, dataservice.accessRequest.deleteItem),
                codeMappings: new EntitySet(dataservice.codeMapping.getItems, dataservice.codeMapping.newItem),
                codesets: new EntitySet(dataservice.codeset.getItems, dataservice.codeset.newItem),
                companies: new EntitySet(dataservice.company.getItems, dataservice.company.newItem, dataservice.company.saveItem, dataservice.company.deleteItem),
               /* company: new EntitySet(dataservice.company.getItems, dataservice.company.newItem, dataservice.company.saveItem, dataservice.company.deleteItem),*/
                companyCandidateProfileSearch: new Entity(dataservice.company.searchCompanyPaged, dataservice.company.newItem),
              
                candidateProfiles: new EntitySet(dataservice.candidateProfile.getItems, dataservice.candidateProfile.newItem, dataservice.candidateProfile.saveItem, dataservice.company.deleteItem),
                organizations: new EntitySet(dataservice.organization.getItems, dataservice.organization.newItem, dataservice.organization.saveItem),
                principalAccessLists: new EntitySet(dataservice.accessList.getItems, dataservice.accessList.newItem, dataservice.accessList.saveItem, dataservice.accessList.deleteItem),
                templates: new EntitySet(dataservice.template.getItems, dataservice.template.newItem, dataservice.template.saveItem),
                userGroups: new EntitySet(dataservice.userGroup.getItems, dataservice.userGroup.newItem, dataservice.userGroup.saveItem, dataservice.userGroup.deleteItem),
                timeZones: new EntitySet(dataservice.timeZone.getItems, dataservice.timeZone.newItem),
                vacancies: new EntitySet(dataservice.vacancy.getItems, dataservice.vacancy.newItem, dataservice.vacancy.saveItem, dataservice.vacancy.deleteItem),
                vacancySearch: new EntitySet(dataservice.vacancy.search, dataservice.vacancy.newVacancySearchResultItem),
                //vacancyApplicants: new EntitySet(dataservice.vacancyApplicant.getItems, dataservice.vacancyApplicant.newItem, dataservice.vacancyApplicant.saveItem),
                myVacancyApplications: new EntitySet(dataservice.vacancyApplicant.getMyApplications, dataservice.vacancyApplicant.newItem),
                vacancyApplications: new EntitySet(dataservice.vacancy.getApplicationItems, dataservice.vacancy.newVacancyApplicationItem),
                candidateProfileSearch: new EntitySet(dataservice.candidateProfile.search, dataservice.candidateProfile.newItem),
                candidateProfileAdvancedSearch: new EntitySet(dataservice.candidateProfile.advancedSearch, dataservice.candidateProfile.newItem),
                updateSubscribers: new EntitySet(dataservice.user.getUpdateSubscribers,  dataservice.user.newPrincipal),
                contents: new EntitySet(dataservice.content.getItems, dataservice.content.newItem, dataservice.content.saveItem),
                quarterlyMagazines: new EntitySet(dataservice.quarterlyMagazine.getItems, dataservice.quarterlyMagazine.newItem, dataservice.quarterlyMagazine.saveItem, dataservice.quarterlyMagazine.deleteItem),
                documentLibraries: new EntitySet(dataservice.documentLibrary.getItems, dataservice.documentLibrary.newItem, dataservice.documentLibrary.saveItem, dataservice.documentLibrary.deleteItem),
                documentLibrariesVitrine: new EntitySet(dataservice.documentLibrary.getThisYearItems, dataservice.documentLibrary.newItem)
            };

            service.companies.getByCountry = function (countryCodeValue) {
                return $.grep(service.companies.items(), function (item) {
                    var organization = service.organizations.getItemById(item.organizationId());

                    return organization.countryCodeValue() === countryCodeValue;
                });
            };

            service.companies.getByCountryAndUser = function (countryCodeValue, currnetUserAccount) {
                return $.grep(service.companies.items(), function (item) {
                    var organization = service.organizations.getItemById(item.organizationId());
                    return organization.countryCodeValue() === countryCodeValue && currnetUserAccount.inOrganization(item.organizationId());
                });
            };

            return service;
        });
})();
