import { Subject, Observable } from 'rxjs';
import Store from 'd2-ui/lib/store/Store';
import { getTableColumnsForType, getFilterFieldsForType, getFiltersForType } from '../config/maintenance-models';

export default Store.create({
    listSourceSubject: new Subject(),
    initialise() {
        this.listSourceSubject
            .concatAll()
            .subscribe((modelCollection) => {
                this.setState({
                    tableColumns: getTableColumnsForType(modelCollection.modelDefinition.name),
                    pager: modelCollection.pager,
                    list: modelCollection.toArray(),
                    filters: this.state && this.state.filters
                        ? Object.assign(this.state.filters, getFilterFieldsForType(modelCollection.modelDefinition.name)
                            .filter(key => !Object.keys(this.state.filters).includes(key))
                            .reduce((f, k) => {
                                f[k] = null;
                                return f;
                            }, {}))
                        : getFiltersForType(modelCollection.modelDefinition.name),
                    searchString: this.state ? this.state.searchString : '',
                    modelType: modelCollection.modelDefinition.name,
                    modelDefinition: modelCollection.modelDefinition,
                });
            });
        return this;
    },

    getNextPage() {
        this.listSourceSubject.next(Observable.fromPromise(this.state.pager.getNextPage()));
    },

    getPreviousPage() {
        this.listSourceSubject.next(Observable.fromPromise(this.state.pager.getPreviousPage()));
    },
}).initialise();
