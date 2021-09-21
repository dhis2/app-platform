import React, { Component, PropTypes } from 'react';
import { noop } from 'lodash/fp';
import log from 'loglevel';
import { Observable } from 'rxjs';

export default class CKEditor extends Component {
    constructor(props, context) {
        super(props, context);

        this.subscriptions = new Set();
    }

    componentDidMount() {
        const { onEditorChange = noop, onEditorInitialized = noop } = this.props;

        if (!window.CKEDITOR) {
            log.error('CKEDITOR namespace can not be found on the window. You probably forgot to load the CKEditor script');
        }

        this.editor = window.CKEDITOR.replace(this.editorContainer, {
            plugins: [
                'a11yhelp', 'basicstyles', 'bidi', 'blockquote',
                'clipboard', 'colorbutton', 'colordialog', 'contextmenu',
                'dialogadvtab', 'div', 'elementspath', 'enterkey',
                'entities', 'filebrowser', 'find', 'floatingspace',
                'font', 'format', 'horizontalrule', 'htmlwriter',
                'image', 'indentlist', 'indentblock', 'justify',
                'link', 'list', 'liststyle', 'magicline',
                'maximize', 'forms', 'pastefromword', 'pastetext',
                'preview', 'removeformat', 'resize', 'selectall',
                'showblocks', 'showborders', 'sourcearea', 'specialchar',
                'stylescombo', 'tab', 'table', 'tabletools',
                'toolbar', 'undo', 'wsc', 'wysiwygarea',
            ].join(','),
            removePlugins: 'scayt,wsc,about',
            allowedContent: true,
            extraPlugins: 'div',
            height: 500,
        });

        this.editor.setData(this.props.initialContent);

        // editor 'change'-event is not fired in source-mode,
        // This results in the need to switch back to HTML-mode to save source-data
        // Therefore we setup this observable when switching to source
        // See https://jira.dhis2.org/browse/DHIS2-5276
        let sourceChange$ = Observable.fromEventPattern(x => this.editor.on('mode', x))
            .switchMap(e => {
                if (e.editor.mode === 'source') {
                    const editable = e.editor.editable();
                    return Observable.fromEventPattern(x =>
                        editable.attachListener(editable, 'input', x)
                    );
                }
                return Observable.empty();
            });

        const editorChangeSubscription = Observable.fromEventPattern((x) => { this.editor.on('change', x); })
            .merge(sourceChange$)
            .debounceTime(250)
            .subscribe(() => {
                onEditorChange(this.editor.getData());
            });

        this.subscriptions.add(editorChangeSubscription);

        // Callback to the parent to pass the editor instance so the parent can call functions on it like insertHTML.
        onEditorInitialized(this.editor);
    }

    componentWillUnmount() {
        if (this.editor) {
            this.editor.destroy();
        }

        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    shouldComponentUpdate() {
        return false;
    }

    setContainerRef = (textarea) => {
        this.editorContainer = textarea;
    }

    render() {
        return (
            <textarea ref={this.setContainerRef} />
        );
    }
}

CKEditor.propTypes = {
    /**
     * Change handler that will be called when the content of the editor changed.
     */
    onEditorChange: PropTypes.func,
    /**
     * This callback will be called when the editor is mounted to the DOM. It will receive the instance of the CKEditor
     * that was mounted.
     */
    onEditorInitialized: PropTypes.func,
    /**
     * This is the initial content that the editor should render with. This content will only be added on the
     * `componentDidMount` lifecycle, updating the content will need to be done though setting it on the editor instance
     * directly by calling CKEditor functions like `editor.insertHtml()`.
     */
    initialContent: PropTypes.string,
};
