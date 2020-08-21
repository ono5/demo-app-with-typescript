    // Project Type
    // any型を定義するのはよくない -> 自分で定義
    // リテラル型などは自分でプロパティ名を覚える必要がある -> これもよくない
    // このような場合は、自分で型を定義した方が良い
    export enum ProjectStatus {
        Active, Finished
    }
    // クラスだがプロジェクトの型のようなもの
    export class Project {
        constructor(
            public id: string,
            public title: string,
            public description: string,
            public manday: number,
            public status: ProjectStatus
            ) {}
    }
