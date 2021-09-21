const ObserverRegistry = {
    componentWillMount() {
        this.observerDisposables = [];
    },

    componentWillUnmount() {
        this.observerDisposables.forEach(disposable => disposable.unsubscribe());
    },

    registerDisposable(disposable) {
        this.observerDisposables.push(disposable);
    },
};

export default ObserverRegistry;
