export default interface User {
    id: string,
    fullName: string,
    email: string,
    phone: string,
    password: string,
    role: string,
    orders: string[],
}