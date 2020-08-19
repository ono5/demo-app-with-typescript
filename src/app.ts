// Drag & Drop
// DragするクラスやDragしたものを受け取るクラスが特定の機能を決まった形で実装できる
// より大きいアプリケーションのとき、わかりやすいコードになる
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

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
        public manday: number,
        public status: ProjectStatus
        ) {}
}

// リスナー型を定義
// 関数を定義
type Listener<T> = (items: T[]) => void

class State<T> {
    protected listeners: Listener<T>[] = []

    // イベントリスナー関数を登録
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}

// Project State Management
// シングルトン適用
class ProjectState extends State<Project> {
    private projects: Project[] = []
    private static instance: ProjectState

    private constructor() {
        super()
    }

    // アプリケーションでこのインスタンスは常に一つ
    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new ProjectState()
        return this.instance
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
        this.updateListeners();
    }

    // プロジェクトのステータスを変更する
    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        // ステータスが本当に変わる場合だけ実行
        // これを入れないとドラッグしていない場合も機能してしまう
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
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

// Component Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement
    hostElement: T
    element: U

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement
        this.hostElement = document.getElementById(hostElementId) as T
        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as U
        if (newElementId) {
            this.element.id = newElementId
        }
        this.attach(insertAtStart)
    }

    // abstractメソッドは具体的な実装はしない
    // 継承先のクラスでこのメソッドを実装することを強制する
    abstract configure(): void
    abstract renderContent(): void

    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(
            insertAtBeginning ? 'afterbegin' : 'beforeend', this.element)
    }
}

// ProjectItem class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
    private project: Project

    get manday() {
        if (this.project.manday < 20) {
            return this.project.manday.toString() + '人日'
        } else {
            return (this.project.manday / 20).toString() + '人月'
        }
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id)
        this.project = project

        this.configure()
        this.renderContent()
    }

    // Interface Method
    // インターフェースにメソッドを定義しておくことで、
    // Drag処理をどこに書けばいいのかわかりやすくなる
    @autobind
    dragStartHandler(event: DragEvent) {
        // Dragした時データを転送するためのプロパティ
        event.dataTransfer!.setData('text/plain', this.project.id)
        // ブラウザ上でのカーソル表示設定
        event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_: DragEvent) {
        console.log('End Drag')
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }

    renderContent() {
        // this.element => single-projectの<li>
        this.element.querySelector('h2')!.textContent= this.project.title
        this.element.querySelector('h3')!.textContent = this.manday
        this.element.querySelector('p')!.textContent = this.project.description
    }
}

// ProjectList Class
// プロジェクトのリストを表示する
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    // プロジェクトの配列を保存するためのプロパティ
    assignedProjects: Project[]

    // typeというプロパティをクラスに定義
    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false,`${type}-projects`)
        this.assignedProjects = []

        this.configure()
        this.renderContent()
    }

    @autobind
    dragOverHandler(event: DragEvent) {
        // ProjectItemのdragStartHandlerから転送されてくる
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            // javascriptは基本的にはdragイベントを許可していないので、設定解除
            // これによりdropHandlerを呼ぶことが可能
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }

    @autobind
    dropHandler(event: DragEvent) {
        // console.log(event.dataTransfer!.getData('text/plain'))
        // dragStartHandlerからidが渡される
        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(
            prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
    }

    @autobind
    dragLeaveHandler(_: DragEvent) {
        const listEl = this.element.querySelector('ul')!
        listEl.classList.remove('droppable')
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('drop', this.dropHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)
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
    }

    renderContent() {
        const listId = `${this.type}-projects-list`
        // ulにidを追加する
        this.element.querySelector('ul')!.id = listId
        // h2にメッセージを追加する
        this.element.querySelector('h2')!.textContent = this.type === 'active' ? '実行中プロジェクト' : '完了プロジェクト'
    }

    private renderProjects() {
        const listEl = document.getElementById(
            `${this.type}-projects-list`)! as HTMLUListElement
        // リストを一旦からにしてから、要素を加える
        // そうでないとデータが重複して表示される
        listEl.innerHTML = ''
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(listEl.id, prjItem)
        }
    }
}

// Project Input Class
// フォームの表示と入力値を取得
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    mandayInputElement: HTMLInputElement

    constructor() {
        super('project-input', 'app', true, 'user-input')

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.mandayInputElement = this.element.querySelector('#manday') as HTMLInputElement

        this.configure()
    }

    // EventListnerの登録を行う
    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent() {}

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

}

const prjInput = new ProjectInput()
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')
