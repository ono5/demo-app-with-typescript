// Drag & Drop
// DragするクラスやDragしたものを受け取るクラスが特定の機能を決まった形で実装できる
// より大きいアプリケーションのとき、わかりやすいコードになる
export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

export interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}
