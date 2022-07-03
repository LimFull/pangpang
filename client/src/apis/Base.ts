import axios, {AxiosInstance} from 'axios';

export class Base {
    baseApi = 'http://localhost:8001';
    baseApiInstance: (path) => AxiosInstance = Base.setInstance(this.baseApi);
    base: AxiosInstance;

    constructor() {
        this.base = this.baseApiInstance('/');
    }

    static setInstance(baseUrl) {
        return (path) => {
            return axios.create({
                baseURL: `${baseUrl}${path}`,
                // withCredentials: true,
            });
        };
    }
}
