import { Project, ProjectStatus } from '../models/project'

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
export class ProjectState extends State<Project> {
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
export const projectState = ProjectState.getInstance()
