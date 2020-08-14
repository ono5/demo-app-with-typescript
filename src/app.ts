// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    // オリジナルのメソッドを取得
    const originalMethod = descriptor.value
    // 設定を変更後のディスクリプタを作成
    const adjDescriptor: PropertyDescriptor = {
        // プロパティを変更できるようにする
        configurable: true,
        // オリジナルの関数にアクセスしようとした時に、実行される
        get() {
            const boundFn = originalMethod.bind(this)
            return boundFn
        }
    }
    return adjDescriptor
}


// Project Input Class
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

    // ユーザーの入力値を全て取得する
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredManday = this.mandayInputElement.value

        // バリデーション
        if (enteredTitle.trim().length === 0 ||
            enteredDescription.trim().length === 0 ||
            enteredManday.trim().length === 0
            ) {
                alert('Invalid input value, Try it again!')
                return
            } else {
                // +をつけるとstring->numberになる
                return [enteredTitle, enteredDescription, +enteredManday]
            }
    }

    private clearInputs() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.mandayInputElement.value = ''
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault()
        const userInput = this.gatherUserInput()
        // Tupleはarrayでもある
        if (Array.isArray(userInput)) {
            const [title, desc, manday] = userInput
            console.log({title}, {desc}, {manday})
            this.clearInputs()
        }
    }

    // EventListnerの登録を行う
    private configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    //　要素を追加する
    private attach() {
        // <div id="app">直後にインポートしたHTMLを追加する
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const prjInput = new ProjectInput()
