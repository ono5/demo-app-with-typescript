class ProjectInput {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    mandayInputElement: HTMLInputElement

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

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.mandayInputElement = this.element.querySelector('#manday') as HTMLInputElement

        this.configure()
        this.attach()
    }

    private submitHandler(event: Event) {
        event.preventDefault()
        console.log(this.titleInputElement.value)
        console.log(this.descriptionInputElement.value)
        console.log(this.mandayInputElement.value)
    }

    // EventListnerの登録を行う
    private configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this))
    }

    //　要素を追加する
    private attach() {
        // <div id="app">直後にインポートしたHTMLを追加する
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const prjInput = new ProjectInput()
