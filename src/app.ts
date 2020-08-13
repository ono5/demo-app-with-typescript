class ProjectInput {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement

    constructor() {
        // template要素への参照
        // getElementByIdの戻り値が不明であるため、型キャストが必要
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement
        // templateを表示する親要素への参照
        this.hostElement = <HTMLDivElement>document.getElementById('app')!

        // form以下をインポート
        const importedNode = document.importNode(this.templateElement.content, true)
        // Domに追加したい具体的にHTML要素を取得する
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input'
        this.attach()
    }

    //　要素を追加する
    private attach() {
        // <div id="app">直後にインポートしたHTMLを追加する
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const prjInput = new ProjectInput()
