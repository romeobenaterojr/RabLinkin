import { makeAutoObservable} from 'mobx';

export default class CounterStore {
    title = 'Counter store';
    count = 42;
    event: string[] = [
        `Initial count is ${this.count}`
    ]

    
    constructor() {
     makeAutoObservable(this)  
    }

    increment = (amount = 1) => {
        this.count += amount;
        this.event.push(`Incremented by ${amount} - count is now ${this.count}`)
    }

    decrement = (amount = 1) => {
        this.count -= amount;
        this.event.push(`Decremented by ${amount} - count is now ${this.count}`)
    }

    get eventCount() {
        return this.event.length
    }
}