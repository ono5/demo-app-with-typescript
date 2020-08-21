import Component from './base-component'
import * as Validation from '../utils/validation'
import { projectState } from '../state/project'
import { autobind as Autobind } from '../decorators/autobind'


// Project Input Class
// フォームの表示と入力値を取得
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
        const titleValidatable: Validation.Validatable = {
            value: enteredTitle,
            required: true
        }

        const descriptionValidatable: Validation.Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }

        const mandayValidatable: Validation.Validatable = {
            value: +enteredManday,
            required: true,
            min: 1,
            max: 1000
        }

        if (
            !Validation.validate(titleValidatable) ||
            !Validation.validate(descriptionValidatable) ||
            !Validation.validate(mandayValidatable)
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

    @Autobind
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
