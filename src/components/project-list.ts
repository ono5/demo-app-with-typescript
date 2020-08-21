import Component from './base-component'
import { ProjectItem } from './project-item'
import { Project, ProjectStatus } from '../models/project'
import { DragTarget } from '../models/drag-drop'
import { autobind } from '../decorators/autobind'
import { projectState } from '../state/project'

// ProjectList Class
// プロジェクトのリストを表示する
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
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
