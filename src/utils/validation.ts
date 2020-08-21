// Validation
// ここではバリデートする型を定義する
// required以下はオプションにするため?をつけている
export interface Validatable {
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
}

export function validate(validatableInput: Validatable) {
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
