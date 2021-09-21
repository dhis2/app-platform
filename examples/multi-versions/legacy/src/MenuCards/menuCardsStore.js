import appStateStore from '../App/appStateStore';
import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';
import { Observable } from 'rxjs';
import { getInstance } from 'd2/lib/d2';
import { goToRoute } from '../router-utils';

async function createCardsFromMetaDataSections(metaDataSections) {
    const d2 = await getInstance();

    return metaDataSections
        .map(metaDataSection => ({
            key: metaDataSection.name,
            name: d2.i18n.getTranslation(camelCaseToUnderscores(metaDataSection.name)),
            items: metaDataSection.items
                    .map(({ key, label }) => ({
                        name: label,
                        description: d2.i18n.getTranslation(`intro_${camelCaseToUnderscores(key)}`),
                        canCreate: d2.currentUser.canCreate(d2.models[key]),
                        add: () => goToRoute(`/edit/${metaDataSection.name}/${key}/add`),
                        list: () => goToRoute(`/list/${metaDataSection.name}/${key}`),
                    })),
        }));
}

export default appStateStore
    .map((appState) => {
        const cardState = appState.sideBar.mainSections
            .map(v => v.key)
            .reduce((cardState, mainSectionName) => cardState.concat([{
                name: mainSectionName,
                items: appState.sideBar[mainSectionName] || [],
            }]), []);

        return cardState;
    })
    .take(1)
    .map(metaDataSections => Observable.fromPromise(createCardsFromMetaDataSections(metaDataSections)))
    .concatAll();
