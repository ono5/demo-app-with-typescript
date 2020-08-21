import { Draggable } from '../models/drag-drop'
import Component from './base-component'
import { Project } from '../models/project'
import { autobind } from '../decorators/autobind'

// ProjectItem class
export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
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
