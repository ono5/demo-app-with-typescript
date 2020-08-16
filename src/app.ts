// Validation
// ここではバリデートする型を定義する
// required以下はオプションにするため?をつけている
interface Validatable {
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
}

function validate(validatableInput: Validatable) {
    let isValid = true
    // check require
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }
    // check minLength
    // 文字列の場合のみチェックする
    // minLengthに0が設定されていてもnullチェックで弾ける
    if (validatableInput.minLength != null && validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength
    }

    // check maxLength
    if (validatableInput.maxLength != null && validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
    }

    // check min
    if (validatableInput.min != null && validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value.length >= validatableInput.min
    }

    // check max
    if (validatableInput.max != null && validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value.length <= validatableInput.max
    }
    return isValid
}

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

// ProjectList Class
// プロジェクトのリストを表示する
class ProjectList {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLElement

    // typeというプロパティをクラスに定義
    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement
        this.hostElement = <HTMLDivElement>document.getElementById('app')!

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLElement;
        // リストは、active / finishの2種類のリストが存在する
        this.element.id = `${this.type}-projects`

        this.attach()
    }

    private attach() {
        // beforeend -> 終了タグの前に設置
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }
}

// Project Input Class
// フォームの表示と入力値を取得
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
        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }

        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }

        const mandayValidatable: Validatable = {
            value: +enteredManday,
            required: true,
            min: 1,
            max: 1000
        }

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(mandayValidatable)
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
