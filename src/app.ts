// Project Type
// any型を定義するのはよくない -> 自分で定義
// リテラル型などは自分でプロパティ名を覚える必要がある -> これもよくない
// このような場合は、自分で型を定義した方が良い
enum ProjectStatus {
    Active, Finished
}
// クラスだがプロジェクトの型のようなもの
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public mandy: number,
        public status: ProjectStatus
        ) {}
}

// リスナー型を定義
// 関数を定義
type Listener = (items: Project[]) => void

// Project State Management
// シングルトン適用
class ProjectState {
    // イベントリスナーのリスト
    private listeners: Listener[] = []
    private projects: Project[] = []
    private static instance: ProjectState

    private constructor() {}

    // アプリケーションでこのインスタンスは常に一つ
    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new ProjectState()
        return this.instance
    }

    // イベントリスナー関数を登録
    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn)
    }

    // プロジェクトを追加
    addProject(title: string, description: string, manday: number) {
        // このやり方だとプロパティ名を自分で覚えておかないといけない
        // const newProject = {
        //     id: Math.random().toString(),
        //     title: title,
        //     description: description,
        //     manday: manday
        // }

        // クラス型を定義すれば、インスタンス化するだけ
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            manday,
            ProjectStatus.Active
        )
        this.projects.push(newProject)
        for (const listenerFn of this.listeners) {
            // プロジェクトのリストを管理するためなので、引数にはプロジェクトのリストを渡す
            // ただし、コピーを渡すべきなので、sliceメソッドでコピーをする
            listenerFn(this.projects.slice())
        }
    }
}

// 状態管理をするオブジェクトはアプリケーション内で必ず一つだけ(シングルトンパターンを適用)
const projectState = ProjectState.getInstance()

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
    // プロジェクトの配列を保存するためのプロパティ
    assignedProjects: Project[]

    // typeというプロパティをクラスに定義
    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement
        this.hostElement = <HTMLDivElement>document.getElementById('app')!
        this.assignedProjects = []

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLElement;
        // リストは、active / finishの2種類のリストが存在する
        this.element.id = `${this.type}-projects`

        // リストに変更があった時発動したいイベントを登録
        // 新しいリストを表示したい
        projectState.addListener((projects: Project[]) => {
            // フィルタリングを行う
            const relevantProjects = projects.filter(prj => {
                // typeはインスタンス化した時に決定される
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active
                }
                return prj.status === ProjectStatus.Finished
            })
            // projectsは何らかの変更が行われたリスト
            this.assignedProjects = relevantProjects
            this.renderProjects()
        })

        this.attach()
        this.renderContent()
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
        for (const prjItem of this.assignedProjects) {
            // リストの項目を追加する
            const listItem = document.createElement('li')
            listItem.textContent = prjItem.title
            listEl?.appendChild(listItem)
        }
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`
        // ulにidを追加する
        this.element.querySelector('ul')!.id = listId
        // h2にメッセージを追加する
        this.element.querySelector('h2')!.textContent = this.type === 'active' ? '実行中プロジェクト' : '完了プロジェクト'
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
            // グローバル変数であるため、クラスの内部から別のクラスのメソッドを呼び出せる
            projectState.addProject(title, desc, manday)
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
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')
