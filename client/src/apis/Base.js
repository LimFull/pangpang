import axios from 'axios';

export class Base {
    static setInstance(baseUrl) {
        return (path) => {
            const instance = axios.create({
                baseURL: `${baseUrl}${path}`,
                withCredentials: true,
            });

            return instance;
        };
    }

    baseApi = 'http://localhost:8001';
    baseApiInstance = Base.setInstance(this.baseApi);
    base;

    constructor() {
        this.base = this.baseApiInstance('/');
    }
}
