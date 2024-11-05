export default interface User {
    id: string,
    fullName: string,
    email: string,
    phone: string,
    avatar: string,
    password: string,
    role: string,
    orders: string[],
}